import { format, getYear, getMonth, getWeek, getDate } from "date-fns";
import { ParsedData } from "./types";

/**
 * Generates derived date columns based on transform type
 */
function generateDateColumn(date: Date, transform: string): string | number {
  switch (transform) {
    case "year":
      return getYear(date);
    case "month":
      return format(date, "MMM yyyy"); // e.g., "Jan 2023"
    case "week":
      return `Week ${getWeek(date)} ${getYear(date)}`;
    case "day":
      return format(date, "MMM dd, yyyy"); // e.g., "Jan 15, 2023"
    default:
      return format(date, "MMM dd, yyyy");
  }
}

/**
 * Identifies date columns in the dataset
 */
function findDateColumns(data: ParsedData): string[] {
  if (data.length === 0) return [];

  const dateColumns: string[] = [];
  const firstRow = data[0];

  for (const [key, value] of Object.entries(firstRow)) {
    if (value instanceof Date) {
      dateColumns.push(key);
    }
  }

  return dateColumns;
}

/**
 * Generates derived columns from date fields
 */
export function generateDerivedColumns(
  data: ParsedData,
  requiredTransforms: Array<{ field: string; transform: string }>
): ParsedData {
  if (data.length === 0) return data;

  const dateColumns = findDateColumns(data);

  return data.map((row) => {
    const newRow = { ...row };

    // Generate derived columns for each required transform
    requiredTransforms.forEach(({ field, transform }) => {
      if (dateColumns.includes(field) && row[field] instanceof Date) {
        const derivedColumnName = `${field}_${transform}`;
        newRow[derivedColumnName] = generateDateColumn(row[field], transform);
      }
    });

    return newRow;
  });
}

/**
 * Determines what derived columns need to be generated based on chart config
 */
export function getRequiredDerivedColumns(
  groupBy?: string,
  groupByTransform?: string,
  data?: ParsedData
): Array<{ field: string; transform: string }> {
  const required: Array<{ field: string; transform: string }> = [];

  if (groupBy && groupByTransform && groupByTransform !== "none" && data && data.length > 0) {
    // Check if the groupBy field is a date field
    const firstRow = data[0];
    if (firstRow[groupBy] instanceof Date) {
      required.push({ field: groupBy, transform: groupByTransform });
    }
  }

  return required;
}
