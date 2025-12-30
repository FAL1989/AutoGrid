"use client";

import { useState } from "react";
import { useBots } from "@/hooks/use-bots";
import { useBotPerformanceReport, useStrategyComparisonReport } from "@/hooks/use-reports";
import { apiClient } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function ReportsPage() {
  const { data: bots } = useBots();
  const { data: botReports, isLoading: botsLoading } = useBotPerformanceReport();
  const { data: strategyReports, isLoading: strategiesLoading } = useStrategyComparisonReport();
  const [exportBotId, setExportBotId] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const botId = exportBotId === "all" ? undefined : exportBotId;
      const blob = await apiClient.downloadTradesCsv(botId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = botId ? `trades_${botId}.csv` : "trades_all.csv";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Performance by bot, strategy comparisons, and trade exports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Strategy Comparison</h2>
          {strategiesLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : strategyReports && strategyReports.length > 0 ? (
            <div className="space-y-3">
              {strategyReports.map((strategy) => (
                <div
                  key={strategy.strategy}
                  className="flex items-center justify-between border border-border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium capitalize">{strategy.strategy}</p>
                    <p className="text-xs text-muted-foreground">
                      {strategy.total_bots} bots · {strategy.total_trades} trades
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(strategy.total_pnl)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Win rate {formatPercent(strategy.win_rate * 100, 1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No strategy data available yet.
            </p>
          )}
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Export Trades</h2>
          <div className="flex flex-col gap-3">
            <select
              value={exportBotId}
              onChange={(event) => setExportBotId(event.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background"
            >
              <option value="all">All bots</option>
              {bots?.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isExporting ? "Preparing..." : "Download CSV"}
            </button>
            <p className="text-xs text-muted-foreground">
              CSV includes timestamp, bot, symbol, side, price, quantity, fee, and P&amp;L.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Bot Performance</h2>
        </div>
        {botsLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : botReports && botReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="text-left py-2">Bot</th>
                  <th className="text-left py-2">Strategy</th>
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-right py-2">Trades</th>
                  <th className="text-right py-2">Win Rate</th>
                  <th className="text-right py-2">Realized P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {botReports.map((bot) => (
                  <tr key={bot.bot_id} className="border-t border-border">
                    <td className="py-2 font-medium">{bot.name}</td>
                    <td className="py-2 capitalize">{bot.strategy}</td>
                    <td className="py-2">{bot.symbol}</td>
                    <td className="py-2 text-right">{bot.total_trades}</td>
                    <td className="py-2 text-right">
                      {formatPercent(bot.win_rate * 100, 1)}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(bot.realized_pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No bot performance data yet.
          </p>
        )}
      </div>
    </div>
  );
}
