"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  Area,
  AreaChart,
} from "recharts";
import { memo } from "react";

interface MetricChartProps {
  data: { step: number; [key: string]: number }[];
  lines: string[];
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
];

const formatYAxisTick = (tick: number) => {
  if (Math.abs(tick) < 1 && tick !== 0) return tick.toFixed(4);

  return Math.round(tick).toString();
};

const MetricChart = memo(({ data, lines }: MetricChartProps) => {
  const sortedData = [...data].sort((a, b) => a.step - b.step);

  const yDomain = (() => {
    let min = Infinity;
    let max = -Infinity;
    sortedData.forEach((point) => {
      lines.forEach((lineId) => {
        const value = point[lineId];
        if (typeof value === "number") {
          if (value < min) min = value;
          if (value > max) max = value;
        }
      });
    });

    if (min === max) return [min - 0.1, max + 0.1];

    return [min - (max - min) * 0.1, max + (max - min) * 0.1];
  })();

  const previewLineId = lines[0];

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          syncId={`chart-${Math.random()}`}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="step" />
          <YAxis
            domain={yDomain}
            allowDataOverflow
            tickFormatter={formatYAxisTick}
            width={80}
          />
          <Tooltip formatter={(value: number) => value.toFixed(5)} />
          <Legend />
          {lines.map((lineId, index) => (
            <Line
              key={lineId}
              type="monotone"
              dataKey={lineId}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}

          <Brush
            dataKey="step"
            height={40}
            stroke="#8884d8"
            travellerWidth={15}
          >
            <LineChart data={sortedData}>
              {lines.map((lineId, index) => (
                <Line
                  key={`brush-${lineId}`}
                  type="monotone"
                  dataKey={lineId}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={1}
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </Brush>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MetricChart.displayName = "MetricChart";

export default MetricChart;
