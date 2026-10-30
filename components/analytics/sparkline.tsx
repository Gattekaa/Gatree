"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  positive?: boolean;
}

export function Sparkline({ data, positive = true }: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className="h-6 w-20">
      <ResponsiveContainer width="100%" height="100%" className="font-mono">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={
              positive ? "var(--color-primary)" : "var(--color-ink-subtle)"
            }
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
