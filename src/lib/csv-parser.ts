import Papa from "papaparse";
import { ParsedData } from "./types";

/**
 * Infers the type of a value and converts it accordingly
 */
function inferType(value: string): any {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  // Try to parse as number
  const numValue = Number(value);
  if (!isNaN(numValue) && isFinite(numValue)) {
    return numValue;
  }

  // Try to parse as boolean
  const lowerValue = value.toLowerCase();
  if (lowerValue === "true" || lowerValue === "false") {
    return lowerValue === "true";
  }

  // Try to parse as date
  const dateValue = new Date(value);
  if (!isNaN(dateValue.getTime()) && value.match(/\d{4}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}/)) {
    return dateValue;
  }

  // Return as string
  return value;
}

/**
 * Parses CSV string and returns data with inferred types
 */
export function parseCSV(csvString: string): ParsedData {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  if (result.errors.length > 0) {
    console.warn("CSV parsing errors:", result.errors);
  }

  // Apply type inference to each row
  const typedData = result.data.map((row: any) => {
    const typedRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      typedRow[key] = inferType(value as string);
    }
    return typedRow;
  });

  return typedData;
}
