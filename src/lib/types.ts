export interface ChartConfig {
  title: string;
  type: "bar" | "line";
  description?: string;
  xAxis: {
    field: string;
    label: string;
  };
  yAxis: {
    field: string;
    label: string;
  };
  series: Array<{
    field: string;
    name: string;
    filter?: string;
  }>;
  filter?: {
    field: string;
    value: string;
  };
  groupBy?: string;
  groupByTransform?: "month" | "year" | "week" | "day" | "none";
}

export type ParsedData = Array<Record<string, any>>;
export type ChartData = Array<Record<string, string | number>>;

export interface SeriesConfig {
  field: string;
  name: string;
  filter?: string;
}
