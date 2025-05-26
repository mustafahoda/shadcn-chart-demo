"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { monthlyData, chartColors } from "@/lib/chart-data";

export function Chart() {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Line Chart Example</h2>
      <ChartContainer
        config={{
          value: {
            label: "Value",
            theme: chartColors.primary,
          },
        }}
      >
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} />
          <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
