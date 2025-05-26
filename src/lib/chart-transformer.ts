/* eslint-disable  @typescript-eslint/no-explicit-any */

import { ParsedData, ChartData, ChartConfig } from "./types";

/**
 * Formats a date value for display on charts
 */
function formatDateForDisplay(dateValue: string | number | Date, groupByTransform?: string): string {
  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return dateValue.toString();
  }

  // Use groupByTransform to determine format
  if (groupByTransform === "month") {
    return date.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
    });
  } else if (groupByTransform === "year") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
    });
  } else if (groupByTransform === "week") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else if (groupByTransform === "day") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  }

  // Default: detect based on date characteristics
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
  };

  // If it's the first day of the month, it's likely a month grouping
  if (date.getDate() === 1) {
    return date.toLocaleDateString("en-US", options);
  } else {
    // Include day for specific dates
    return date.toLocaleDateString("en-US", {
      ...options,
      day: "numeric",
    });
  }
}

/**
 * Transforms processed data into ShadCN chart format
 */
export function transformToChartFormat(processedData: ParsedData, chartConfig: ChartConfig): ChartData {
  if (processedData.length === 0) {
    return [];
  }

  console.log("=== CHART TRANSFORMER DEBUG ===");
  console.log("Processed data sample:", processedData[0]);
  console.log("Available fields:", Object.keys(processedData[0] || {}));
  console.log("Chart config series:", chartConfig.series);

  const { xAxis, series, groupBy, groupByTransform } = chartConfig;

  return processedData.map((row, index) => {
    const chartRow: Record<string, string | number> = {};

    // Determine the actual x-axis field name (might be derived like Date_month)
    let actualXField = xAxis.field;
    if (groupBy && groupByTransform && groupByTransform !== "none") {
      const derivedFieldName = `${groupBy}_${groupByTransform}`;
      if (row.hasOwnProperty(derivedFieldName)) {
        actualXField = derivedFieldName;
      }
    }

    if (index === 0) {
      console.log("Using x-axis field:", actualXField);
    }

    // Set the name field (x-axis value)
    const xValue = row[actualXField];

    // For derived date fields, the value is already formatted
    if (
      actualXField.includes("_month") ||
      actualXField.includes("_year") ||
      actualXField.includes("_week") ||
      actualXField.includes("_day")
    ) {
      chartRow.name = xValue?.toString() || "Unknown";
    } else if (xAxis.field.toLowerCase().includes("date") && xValue) {
      // Format dates nicely for display
      chartRow.name = formatDateForDisplay(xValue, chartConfig.groupByTransform);
      // Store raw value for sorting
      chartRow._rawValue = xValue.toString();
    } else {
      chartRow.name = xValue?.toString() || "Unknown";
    }

    // Add each series as a separate field
    series.forEach((seriesConfig) => {
      // Try series name first, then fall back to field name
      let value = row[seriesConfig.name];

      if (value === undefined) {
        value = row[seriesConfig.field];
      }

      if (index === 0) {
        console.log(`Series "${seriesConfig.name}":`);
        console.log(`  Looking for field: "${seriesConfig.name}" -> ${row[seriesConfig.name]}`);
        console.log(`  Fallback to field: "${seriesConfig.field}" -> ${row[seriesConfig.field]}`);
        console.log(`  Final value: ${value}`);
      }

      if (typeof value === "number") {
        chartRow[seriesConfig.name] = value;
      } else {
        chartRow[seriesConfig.name] = 0;
      }
    });

    return chartRow;
  });
}

/**
 * Sorts chart data by name field for better visualization
 */
export function sortChartData(chartData: ChartData): ChartData {
  return [...chartData].sort((a, b) => {
    // Use raw values for sorting if available (for formatted dates)
    const aValue = (a as any)._rawValue || a.name.toString();
    const bValue = (b as any)._rawValue || b.name.toString();

    // Try to parse as dates first
    const aDate = new Date(aValue);
    const bDate = new Date(bValue);

    // Check if both are valid dates
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return aDate.getTime() - bDate.getTime();
    }

    // Try to sort numerically if possible
    const aNum = Number(aValue);
    const bNum = Number(bValue);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    // Sort alphabetically
    return aValue.localeCompare(bValue);
  });
}
