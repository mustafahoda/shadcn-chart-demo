"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { chartColors } from "@/lib/chart-data";
import { processChartData } from "@/lib/data-processor";
import { ChartConfig, ChartData } from "@/lib/types";

export function BarChartComponent() {
  const [schemaInput, setSchemaInput] = useState(`{
  "title": "Credit vs Debit Transactions by Month",
  "type": "bar",
  "xAxis": {
    "field": "Date",
    "label": "Month"
  },
  "yAxis": {
    "field": "Amount",
    "label": "Amount"
  },
  "description": "Shows a breakdown of credit and debit transactions by month.",
  "groupBy": "Date",
  "groupByTransform": "month",
  "series": [
    {
      "field": "Amount",
      "name": "Credit",
      "filter": "CREDIT"
    },
    {
      "field": "Amount",
      "name": "Debit",
      "filter": "DEBIT"
    }
  ]
}`);

  const [csvInput, setCsvInput] = useState(`Date,Transaction,Amount
2023-01-15,DEBIT,500
2023-01-20,CREDIT,1000
2023-02-10,DEBIT,300
2023-02-05,DEBIT,200
2023-02-25,CREDIT,750
2023-03-12,DEBIT,450
2023-03-20,CREDIT,800
2023-04-05,DEBIT,600
2023-04-15,CREDIT,1200
2023-05-10,DEBIT,350
2023-05-25,CREDIT,900`);

  const [chartData, setChartData] = useState<ChartData>([]);
  const [error, setError] = useState<string>("");
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);

  const testBasicFunctionality = () => {
    try {
      console.log("=== TESTING BASIC FUNCTIONALITY ===");

      // Simple test data
      const testCSV = `Date,Transaction,Amount
2023-01-15,DEBIT,500
2023-01-20,CREDIT,1000`;

      const testConfig: ChartConfig = {
        title: "Test Chart",
        type: "bar",
        xAxis: { field: "Date", label: "Date" },
        yAxis: { field: "Amount", label: "Amount" },
        series: [
          { field: "Amount", name: "Credit", filter: "CREDIT" },
          { field: "Amount", name: "Debit", filter: "DEBIT" },
        ],
        groupBy: "Date",
        groupByTransform: "month",
      };

      console.log("Test CSV:", testCSV);
      console.log("Test Config:", testConfig);

      const result = processChartData(testCSV, testConfig);
      console.log("Test Result:", result);

      if (result.length > 0) {
        setChartData(result);
        setChartConfig(testConfig);
        setError("");
      } else {
        setError("Test failed - no data generated");
      }
    } catch (err) {
      console.error("Test error:", err);
      setError(`Test failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const generateChart = () => {
    try {
      setError("");

      // Parse the schema
      const parsedConfig: ChartConfig = JSON.parse(schemaInput);
      setChartConfig(parsedConfig);

      console.log("=== DEBUGGING CHART GENERATION ===");
      console.log("1. Parsed config:", parsedConfig);
      console.log("2. CSV input:", csvInput);

      // Process the data
      const processedData = processChartData(csvInput, parsedConfig);
      setChartData(processedData);

      console.log("3. Final processed chart data:", processedData);

      if (processedData.length === 0) {
        setError(
          "No data was generated. Please check your CSV data and schema configuration. Check the console for detailed debugging information."
        );
      }
    } catch (err) {
      console.error("Error generating chart:", err);
      setError(`Error: ${err instanceof Error ? err.message : "Invalid JSON schema"}`);
      setChartData([]);
    }
  };

  return (
    <div className="w-full max-w-6xl space-y-6">
      <h2 className="text-2xl font-bold mb-4">Dynamic Bar Chart</h2>

      {/* Input Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Chart Schema (JSON)</label>
          <div className="border rounded-md overflow-hidden">
            <Editor
              height="500px"
              defaultLanguage="json"
              value={schemaInput}
              onChange={(value) => setSchemaInput(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
              theme="vs-light"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CSV Data</label>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="w-full h-[500px] p-3 border rounded-md font-mono text-sm"
            placeholder="Paste your CSV data here..."
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center gap-4">
        <button
          onClick={testBasicFunctionality}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Test Basic Functionality
        </button>
        <button
          onClick={generateChart}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Generate Chart
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Chart Display */}
      {chartData.length > 0 && chartConfig && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">{chartConfig.title}</h3>
          <ChartContainer
            config={{
              ...chartConfig.series.reduce((acc: Record<string, { label: string; color: string }>, series, index) => {
                acc[series.name] = {
                  label: series.name,
                  color: chartColors.series[index] || chartColors.primary.light,
                };
                return acc;
              }, {}),
            }}
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(label) => `${chartConfig.xAxis.label}: ${label}`} />}
              />
              {chartConfig.series.map((series, index) => (
                <Bar
                  key={series.name}
                  dataKey={series.name}
                  fill={chartColors.series[index] || chartColors.primary.light}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </div>
      )}

      {/* Debug Info */}
      {chartData.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Processed Data:</h4>
          <pre className="text-xs overflow-auto">{JSON.stringify(chartData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
