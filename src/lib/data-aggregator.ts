import { ParsedData } from "./types";

/**
 * Groups data by a field and aggregates numeric values
 */
export function groupAndAggregate(data: ParsedData, groupByField: string, aggregateFields: string[]): ParsedData {
  if (data.length === 0) {
    return data;
  }

  // Group data by the specified field
  const groups = new Map<string, any[]>();

  data.forEach((row) => {
    const groupKey = row[groupByField]?.toString() || "Unknown";

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }

    groups.get(groupKey)!.push(row);
  });

  // Aggregate each group
  const aggregatedData: ParsedData = [];

  groups.forEach((groupRows, groupKey) => {
    const aggregatedRow: Record<string, any> = {
      [groupByField]: groupKey,
    };

    // Aggregate numeric fields
    aggregateFields.forEach((field) => {
      const values = groupRows.map((row) => row[field]).filter((value) => typeof value === "number" && !isNaN(value));

      if (values.length > 0) {
        aggregatedRow[field] = values.reduce((sum, value) => sum + value, 0);
      } else {
        aggregatedRow[field] = 0;
      }
    });

    // Copy non-numeric fields from the first row (for reference)
    const firstRow = groupRows[0];
    Object.keys(firstRow).forEach((key) => {
      if (!aggregatedRow.hasOwnProperty(key) && !aggregateFields.includes(key)) {
        aggregatedRow[key] = firstRow[key];
      }
    });

    aggregatedData.push(aggregatedRow);
  });

  return aggregatedData;
}

/**
 * Determines the actual field name to use for grouping
 * (handles derived columns like Date_month)
 */
export function getGroupByFieldName(originalField: string, transform?: string): string {
  if (transform && transform !== "none") {
    return `${originalField}_${transform}`;
  }
  return originalField;
}
