"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { monthlyData, chartColors } from "@/lib/chart-data";

export function AreaChartComponent() {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Area Chart Example</h2>
      <ChartContainer
        config={{
          value: {
            label: "Value",
            theme: chartColors.primary,
          },
        }}
      >
        <AreaChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `Month: ${label}`} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            fill="var(--color-value)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
