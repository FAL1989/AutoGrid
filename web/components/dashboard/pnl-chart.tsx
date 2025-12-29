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
import { usePnLChartData } from "@/hooks/use-dashboard";
import { useRealtimePnL } from "@/hooks/use-realtime";
import { useQueryClient } from "@tanstack/react-query";

export function PnLChart() {
  const queryClient = useQueryClient();
  const { data: chartData, isLoading, error, refetch } = usePnLChartData();

  // Real-time P&L updates
  useRealtimePnL((payload) => {
    queryClient.invalidateQueries({
      queryKey: ["stats", "dashboard", "pnl-chart"]
    });
  });

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Cumulative P&L</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Cumulative P&L</h3>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load P&L data</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = chartData || [];

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
