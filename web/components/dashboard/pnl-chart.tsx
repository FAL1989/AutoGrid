"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function PnLChart() {
  // TODO: Fetch real P&L data from API
  const data = [
    { date: "Jan 1", pnl: 0 },
    { date: "Jan 2", pnl: 45 },
    { date: "Jan 3", pnl: 120 },
    { date: "Jan 4", pnl: 98 },
    { date: "Jan 5", pnl: 234 },
    { date: "Jan 6", pnl: 456 },
    { date: "Jan 7", pnl: 543 },
    { date: "Jan 8", pnl: 489 },
    { date: "Jan 9", pnl: 678 },
    { date: "Jan 10", pnl: 789 },
    { date: "Jan 11", pnl: 876 },
    { date: "Jan 12", pnl: 934 },
    { date: "Jan 13", pnl: 1023 },
    { date: "Jan 14", pnl: 1156 },
    { date: "Jan 15", pnl: 1234 },
  ];

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Cumulative P&L</h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#9CA3AF" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "P&L"]}
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#22C55E"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
