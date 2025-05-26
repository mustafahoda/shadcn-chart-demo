import { ParsedData } from "./types";

export interface FilterConfig {
  field: string;
  value: string;
}

/**
 * Filters data based on field-value matches (using contains logic)
 */
export function filterData(data: ParsedData, filter?: FilterConfig): ParsedData {
  if (!filter || data.length === 0) {
    return data;
  }

  const { field, value } = filter;

  console.log("=== FILTER DATA DEBUG ===");
  console.log("Filter field:", field);
  console.log("Filter value:", JSON.stringify(value));
  console.log("Data before filter:", data.length, "rows");

  // Show sample values from the field being filtered
  const sampleValues = data.slice(0, 3).map((row) => row[field]?.toString());
  console.log("Sample values in field:", sampleValues);

  const filteredData = data.filter((row) => {
    const fieldValue = row[field];

    // Convert to string for comparison to handle different types
    const fieldValueStr = fieldValue?.toString() || "";

    // Use contains matching (case-insensitive) for better flexibility
    const matches = fieldValueStr.toUpperCase().includes(value.toUpperCase());

    if (matches) {
      console.log("FILTER MATCH found:");
      console.log("  Field value:", JSON.stringify(fieldValueStr));
      console.log("  Filter value:", JSON.stringify(value));
    }

    return matches;
  });

  console.log("Data after filter:", filteredData.length, "rows");
  return filteredData;
}

/**
 * Applies multiple filters in sequence
 */
export function applyFilters(data: ParsedData, filters: FilterConfig[]): ParsedData {
  return filters.reduce((filteredData, filter) => {
    return filterData(filteredData, filter);
  }, data);
}
