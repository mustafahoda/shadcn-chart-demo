"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { pieData, chartColors } from "@/lib/chart-data";

export function PieChartComponent() {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Pie Chart Example</h2>
      <ChartContainer
        config={{
          value: {
            label: "Value",
            theme: chartColors.primary,
          },
        }}
      >
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors.pie[index % chartColors.pie.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => `${label}`} />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
