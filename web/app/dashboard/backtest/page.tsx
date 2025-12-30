"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useBacktests, useRunBacktest } from "@/hooks/use-backtest";
import { BacktestResult } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const today = new Date();
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(today.getDate() - 30);

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function BacktestPage() {
  const [strategy, setStrategy] = useState<"grid" | "dca">("grid");
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [startDate, setStartDate] = useState(formatDateInput(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDateInput(today));

  const [gridConfig, setGridConfig] = useState({
    lower_price: 30000,
    upper_price: 60000,
    grid_count: 20,
    investment: 1000,
  });
  const [dcaConfig, setDcaConfig] = useState({
    amount: 100,
    interval: "daily",
    trigger_drop: 5,
    take_profit: 3,
  });

  const runBacktest = useRunBacktest();
  const { data: backtests } = useBacktests({ limit: 10 });

  const result = runBacktest.data as BacktestResult | undefined;
  const chartData = useMemo(
    () =>
      result?.equity_curve?.map((point) => ({
        date: point.date,
        value: point.value,
      })) || [],
    [result]
  );

  const handleSubmit = () => {
    const config = strategy === "grid" ? gridConfig : dcaConfig;
    runBacktest.mutate({
      strategy,
      symbol,
      timeframe,
      start_date: startDate,
      end_date: endDate,
      config,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backtest</h1>
        <p className="text-muted-foreground">
          Run historical simulations to validate strategy performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card space-y-4">
            <h2 className="text-lg font-semibold">Backtest Setup</h2>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Strategy</label>
              <select
                value={strategy}
                onChange={(event) =>
                  setStrategy(event.target.value as "grid" | "dca")
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="grid">Grid</option>
                <option value="dca">DCA</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Symbol</label>
              <input
                value={symbol}
                onChange={(event) => setSymbol(event.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Timeframe</label>
              <select
                value={timeframe}
                onChange={(event) => setTimeframe(event.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="1d">1d</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            {strategy === "grid" ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Grid Config</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={gridConfig.lower_price}
                    onChange={(event) =>
                      setGridConfig((prev) => ({
                        ...prev,
                        lower_price: Number(event.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Lower"
                  />
                  <input
                    type="number"
                    value={gridConfig.upper_price}
                    onChange={(event) =>
                      setGridConfig((prev) => ({
                        ...prev,
                        upper_price: Number(event.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Upper"
                  />
                  <input
                    type="number"
                    value={gridConfig.grid_count}
                    onChange={(event) =>
                      setGridConfig((prev) => ({
                        ...prev,
                        grid_count: Number(event.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Grid count"
                  />
                  <input
                    type="number"
                    value={gridConfig.investment}
                    onChange={(event) =>
                      setGridConfig((prev) => ({
                        ...prev,
                        investment: Number(event.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Investment"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">DCA Config</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={dcaConfig.amount}
                    onChange={(event) =>
                      setDcaConfig((prev) => ({
                        ...prev,
                        amount: Number(event.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Amount"
                  />
                  <select
                    value={dcaConfig.interval}
                    onChange={(event) =>
                      setDcaConfig((prev) => ({
                        ...prev,
                        interval: event.target.value,
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <input
                    type="number"
                    value={dcaConfig.trigger_drop}
                    onChange={(event) =>
                      setDcaConfig((prev) => ({
                        ...prev,
                        trigger_drop: Number(event.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Trigger drop %"
                  />
                  <input
                    type="number"
                    value={dcaConfig.take_profit}
                    onChange={(event) =>
                      setDcaConfig((prev) => ({
                        ...prev,
                        take_profit: Number(event.target.value),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-border bg-background"
                    placeholder="Take profit %"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={runBacktest.isPending}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60"
            >
              {runBacktest.isPending ? "Running..." : "Run Backtest"}
            </button>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold mb-3">Recent Backtests</h2>
            {backtests && backtests.length > 0 ? (
              <div className="space-y-2 text-sm">
                {backtests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {test.strategy.toUpperCase()} · {test.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {test.timeframe} · {test.status}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {test.total_return != null
                        ? `${(test.total_return * 100).toFixed(1)}%`
                        : "--"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No backtests yet.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground">Total Return</p>
              <p className="text-2xl font-bold">
                {result ? `${(result.total_return * 100).toFixed(2)}%` : "--"}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
              <p className="text-2xl font-bold">
                {result ? result.sharpe_ratio.toFixed(2) : "--"}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground">Max Drawdown</p>
              <p className="text-2xl font-bold">
                {result ? `${(result.max_drawdown * 100).toFixed(2)}%` : "--"}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">
                {result ? `${(result.win_rate * 100).toFixed(1)}%` : "--"}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold mb-4">Equity Curve</h2>
            {chartData.length > 0 ? (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Run a backtest to see the equity curve.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
