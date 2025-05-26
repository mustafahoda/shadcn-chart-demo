export const monthlyData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

// Single series
export const singleSeriesData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
];

// Multiple series
export const multipleSeriesData = [
  { name: "Jan", Income: 1000, Expenses: 800 },
  { name: "Feb", Income: 1200, Expenses: 900 },
];

export const pieData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

export const chartColors = {
  primary: {
    light: "#2563eb",
    dark: "#3b82f6",
  },
  secondary: {
    light: "#60a5fa",
    dark: "#93c5fd",
  },
  success: {
    light: "#16a34a",
    dark: "#22c55e",
  },
  warning: {
    light: "#ea580c",
    dark: "#f97316",
  },
  danger: {
    light: "#dc2626",
    dark: "#ef4444",
  },
  pie: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
  series: [
    "#2563eb", // Blue for Credit
    "#dc2626", // Red for Debit
    "#16a34a", // Green
    "#ea580c", // Orange
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
  ],
};
