"use client";

import { useState } from "react";
import { useTradesHistory } from "@/hooks/use-trades";
import { QueryError } from "@/components/ui/error-boundary";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils";

export default function TradesPage() {
  const [botId, setBotId] = useState("all");
  const [side, setSide] = useState("all");
  const [limit, setLimit] = useState(50);

  const { data, isLoading, error, refetch } = useTradesHistory({
    limit,
    botId: botId === "all" ? undefined : botId,
    side: side === "all" ? undefined : (side as "buy" | "sell"),
  });

  const bots = data?.bots ?? [];
  const trades = data?.trades ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trade History</h1>
        <p className="text-muted-foreground">
          All executed trades across your bots.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="bot-filter">
              Bot
            </label>
            <select
              id="bot-filter"
              value={botId}
              onChange={(event) => setBotId(event.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">All bots</option>
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="side-filter">
              Side
            </label>
            <select
              id="side-filter"
              value={side}
              onChange={(event) => setSide(event.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="all">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {trades.length} trades
          </span>
          <button
            onClick={() => setLimit((prev) => prev + 50)}
            className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            Load more
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <QueryError error={error} reset={() => refetch()} title="Failed to load trades" />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">All Trades</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="py-3 px-4 text-left font-medium">Time</th>
                <th className="py-3 px-4 text-left font-medium">Bot</th>
                <th className="py-3 px-4 text-left font-medium">Symbol</th>
                <th className="py-3 px-4 text-left font-medium">Side</th>
                <th className="py-3 px-4 text-right font-medium">Price</th>
                <th className="py-3 px-4 text-right font-medium">Quantity</th>
                <th className="py-3 px-4 text-right font-medium">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    No trades yet. Start a bot to see history here.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="border-t border-border">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatRelativeTime(trade.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(trade.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{trade.botName}</td>
                    <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          trade.side === "buy"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(trade.price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {trade.quantity.toFixed(6)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(() => {
                        const realizedPnl = trade.realized_pnl || 0;
                        if (realizedPnl === 0) {
                          return <span className="text-muted-foreground">-</span>;
                        }

                        return (
                          <span
                            className={
                              realizedPnl >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {realizedPnl >= 0 ? "+" : ""}
                            {formatCurrency(realizedPnl)}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
