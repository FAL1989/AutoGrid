"use client";

import Link from "next/link";
import { useRecentTrades } from "@/hooks/use-trades";
import { TradeRowSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/error-boundary";
import { formatCurrency, formatRelativeTime, getSideColor } from "@/lib/utils";

export function RecentTrades() {
  const { data: trades, isLoading, error, refetch } = useRecentTrades(5);

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="py-2 border-b border-border last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-6 bg-muted rounded animate-pulse" />
                  <div>
                    <div className="w-20 h-4 bg-muted rounded animate-pulse mb-1" />
                    <div className="w-32 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-4 bg-muted rounded animate-pulse mb-1" />
                  <div className="w-20 h-3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        <QueryError error={error} reset={() => refetch()} title="Failed to load trades" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>

      {!trades || trades.length === 0 ? (
        <div className="py-8 text-center">
          <svg
            className="w-10 h-10 mx-auto text-muted-foreground mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm text-muted-foreground">No trades yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Start a bot to see trades here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    trade.side === "buy"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {trade.side.toUpperCase()}
                </span>
                <div>
                  <p className="font-medium">{trade.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {trade.quantity.toFixed(6)} @ {formatCurrency(trade.price)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {trade.realized_pnl !== 0 ? (
                  <p
                    className={`font-medium ${
                      trade.realized_pnl >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {trade.realized_pnl >= 0 ? "+" : ""}
                    {formatCurrency(trade.realized_pnl)}
                  </p>
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(trade.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/trades"
        className="block w-full mt-4 py-2 text-sm text-primary hover:underline text-center"
      >
        View All Trades
      </Link>
    </div>
  );
}
