/* eslint-disable  @typescript-eslint/no-explicit-any */

import { ChartConfig, ChartData, ParsedData } from "./types";
import { parseCSV } from "./csv-parser";
import { generateDerivedColumns, getRequiredDerivedColumns } from "./derived-columns";
import { filterData } from "./data-filter";
import { groupAndAggregate, getGroupByFieldName } from "./data-aggregator";
import { transformToChartFormat, sortChartData } from "./chart-transformer";

/**
 * Processes each series independently and merges the results
 */
function processSeriesData(data: ParsedData, chartConfig: ChartConfig): ParsedData {
  const { series, filter: globalFilter, groupBy, groupByTransform } = chartConfig;

  // Helper function to apply series filter
  const applySeriesFilter = (data: ParsedData, filterValue: string): ParsedData => {
    if (!filterValue) return data;

    console.log("=== SERIES FILTER DEBUG ===");
    console.log("Series filter value:", JSON.stringify(filterValue));
    console.log("Data before series filter:", data.length, "rows");

    // Try to find the appropriate field to filter on
    // Look for common transaction type fields
    const possibleFields = [
      "Transaction",
      "Type",
      "Category",
      "Name",
      "Memo",
      "transaction",
      "type",
      "category",
      "name",
      "memo",
    ];
    const firstRow = data[0] || {};
    const availableFields = Object.keys(firstRow);

    console.log("Available fields:", availableFields);
    console.log("Checking possible fields:", possibleFields);

    // Find the field that contains the filter value
    let filterField = possibleFields.find((field) => availableFields.includes(field));

    // If no standard field found, look for any field that contains the filter value
    if (!filterField) {
      filterField = availableFields.find((field) => {
        return data.some((row) => row[field]?.toString().toUpperCase().includes(filterValue.toUpperCase()));
      });
    }

    console.log("Selected filter field:", filterField);

    if (!filterField) {
      console.warn(`No suitable field found for filter value: ${filterValue}`);
      return data;
    }

    // Show sample values from the selected field
    const sampleValues = data.slice(0, 3).map((row) => row[filterField]?.toString());
    console.log("Sample values in selected field:", sampleValues);

    const filteredData = data.filter((row) => {
      const fieldValue = row[filterField]?.toString() || "";
      const matches = fieldValue.toUpperCase().includes(filterValue.toUpperCase());

      if (matches) {
        console.log("SERIES FILTER MATCH found:");
        console.log("  Field value:", JSON.stringify(fieldValue));
        console.log("  Filter value:", JSON.stringify(filterValue));
      }

      return matches;
    });

    console.log("Data after series filter:", filteredData.length, "rows");
    return filteredData;
  };

  // If no grouping is needed and only one series, apply global filter and return
  if (!groupBy && series.length === 1) {
    console.log("Taking SIMPLE path (no groupBy, single series)");
    let filteredData = filterData(data, globalFilter);

    // Apply series-level filter if exists
    const seriesConfig = series[0];
    if (seriesConfig.filter) {
      filteredData = applySeriesFilter(filteredData, seriesConfig.filter);
    }

    return filteredData;
  }

  console.log("Taking COMPLEX path (groupBy or multiple series)");
  console.log("GroupBy:", groupBy);
  console.log("Series count:", series.length);

  // Process each series separately
  const seriesResults = new Map<string, ParsedData>();

  series.forEach((seriesConfig, index) => {
    console.log(`Processing series ${index + 1}:`, seriesConfig.name);
    let seriesData = [...data];

    // Apply global filter if exists
    if (globalFilter) {
      console.log("Applying global filter...");
      seriesData = filterData(seriesData, globalFilter);
      console.log("After global filter:", seriesData.length, "rows");
    }

    // Apply series-specific filter if exists
    if (seriesConfig.filter) {
      console.log("Applying series filter...");
      seriesData = applySeriesFilter(seriesData, seriesConfig.filter);
      console.log("After series filter:", seriesData.length, "rows");
    } else {
      console.log("No series filter to apply");
    }

    // Group and aggregate if needed
    if (groupBy) {
      console.log("Applying groupBy...");
      const actualGroupByField = getGroupByFieldName(groupBy, groupByTransform);
      console.log("GroupBy field:", actualGroupByField);
      seriesData = groupAndAggregate(seriesData, actualGroupByField, [seriesConfig.field]);
      console.log("After groupBy:", seriesData.length, "rows");
    }

    seriesResults.set(seriesConfig.name, seriesData);
  });

  // Merge series results
  if (seriesResults.size === 1) {
    return Array.from(seriesResults.values())[0];
  }

  // For multiple series, merge by the groupBy field (or x-axis field)
  const mergeKey = groupBy ? getGroupByFieldName(groupBy, groupByTransform) : chartConfig.xAxis.field;
  const mergedData: ParsedData = [];
  const mergedKeys = new Set<string>();

  // Collect all unique keys
  seriesResults.forEach((seriesData) => {
    seriesData.forEach((row) => {
      const key = row[mergeKey]?.toString() || "Unknown";
      mergedKeys.add(key);
    });
  });

  // Create merged rows
  mergedKeys.forEach((key) => {
    const mergedRow: Record<string, any> = { [mergeKey]: key };

    series.forEach((seriesConfig) => {
      const seriesData = seriesResults.get(seriesConfig.name) || [];
      const matchingRow = seriesData.find((row) => (row[mergeKey]?.toString() || "Unknown") === key);

      if (matchingRow) {
        mergedRow[seriesConfig.name] = matchingRow[seriesConfig.field];
        // Copy other fields from the first series
        if (Object.keys(mergedRow).length === 1) {
          Object.keys(matchingRow).forEach((field) => {
            if (field !== mergeKey && field !== seriesConfig.field) {
              mergedRow[field] = matchingRow[field];
            }
          });
        }
      } else {
        mergedRow[seriesConfig.name] = 0;
      }
    });

    mergedData.push(mergedRow);
  });

  return mergedData;
}

/**
 * Main function to process CSV data according to chart configuration
 */
export function processChartData(csvString: string, chartConfig: ChartConfig): ChartData {
  try {
    console.log("=== DATA PROCESSOR DEBUG ===");
    console.log("Input CSV:", csvString);
    console.log("Chart config:", chartConfig);

    // Step 1: Parse CSV
    let data = parseCSV(csvString);
    console.log("Step 1 - Parsed CSV data:", data);

    if (data.length === 0) {
      console.warn("No data found in CSV");
      return [];
    }

    // Step 2: Generate derived columns if needed
    const requiredDerivedColumns = getRequiredDerivedColumns(chartConfig.groupBy, chartConfig.groupByTransform, data);
    console.log("Step 2 - Required derived columns:", requiredDerivedColumns);

    if (requiredDerivedColumns.length > 0) {
      data = generateDerivedColumns(data, requiredDerivedColumns);
      console.log("Step 2 - Data after derived columns:", data);
    }

    // Step 3: Process series data (filtering, grouping, aggregating)
    const processedData = processSeriesData(data, chartConfig);
    console.log("Step 3 - Processed series data:", processedData);

    // Step 4: Transform to chart format
    let chartData = transformToChartFormat(processedData, chartConfig);
    console.log("Step 4 - Chart format data:", chartData);

    // Step 5: Sort data for better visualization
    chartData = sortChartData(chartData);
    console.log("Step 5 - Final sorted data:", chartData);

    return chartData;
  } catch (error) {
    console.error("Error processing chart data:", error);
    return [];
  }
}

/**
 * Validates that required fields exist in the data
 */
export function validateChartConfig(data: ParsedData, chartConfig: ChartConfig): string[] {
  const errors: string[] = [];

  if (data.length === 0) {
    return ["No data available"];
  }

  const firstRow = data[0];
  const availableFields = Object.keys(firstRow);

  // Check x-axis field
  if (!availableFields.includes(chartConfig.xAxis.field)) {
    errors.push(`X-axis field '${chartConfig.xAxis.field}' not found in data`);
  }

  // Check series fields
  chartConfig.series.forEach((series) => {
    if (!availableFields.includes(series.field)) {
      errors.push(`Series field '${series.field}' not found in data`);
    }
  });

  // Check groupBy field
  if (chartConfig.groupBy && !availableFields.includes(chartConfig.groupBy)) {
    errors.push(`GroupBy field '${chartConfig.groupBy}' not found in data`);
  }

  // Check filter field
  if (chartConfig.filter && !availableFields.includes(chartConfig.filter.field)) {
    errors.push(`Filter field '${chartConfig.filter.field}' not found in data`);
  }

  return errors;
}
