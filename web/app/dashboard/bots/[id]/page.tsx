"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBot, useStartBot, useStopBot } from "@/hooks/use-bots";
import { useOpenOrders, useOrderStats } from "@/hooks/use-orders";
import { useTrades } from "@/hooks/use-trades";
import { GridVisualization } from "@/components/dashboard/grid-visualization";
import { QueryError } from "@/components/ui/error-boundary";
import { ButtonSpinner } from "@/components/ui/spinner";
import { StatsCardSkeleton, TableSkeleton, Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
  formatPercent,
  getStatusColor,
} from "@/lib/utils";
import type { DCAConfig, GridConfig } from "@/lib/api";

const statusLabels = {
  running: "Running",
  stopped: "Stopped",
  paused: "Paused",
  error: "Error",
  starting: "Starting",
  stopping: "Stopping",
};

export default function BotDetailPage() {
  const params = useParams();
  const botId = typeof params?.id === "string" ? params.id : params?.id?.[0] ?? "";

  const {
    data: bot,
    isLoading: botLoading,
    error: botError,
    refetch: refetchBot,
  } = useBot(botId);
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useOrderStats(botId);
  const {
    data: openOrders,
    isLoading: openOrdersLoading,
    error: openOrdersError,
    refetch: refetchOpenOrders,
  } = useOpenOrders(botId);
  const {
    data: trades,
    isLoading: tradesLoading,
    error: tradesError,
    refetch: refetchTrades,
  } = useTrades(botId, { limit: 10 });

  const startBot = useStartBot();
  const stopBot = useStopBot();

  if (!botId) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Missing bot id.
      </div>
    );
  }

  if (botLoading) {
    return <BotDetailSkeleton />;
  }

  if (botError) {
    return (
      <QueryError error={botError} reset={() => refetchBot()} title="Failed to load bot" />
    );
  }

  if (!bot) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Bot not found.
      </div>
    );
  }

  const totalPnl = bot.realized_pnl + bot.unrealized_pnl;
  const pnlColor = totalPnl >= 0 ? "text-green-500" : "text-red-500";
  const isStartingStatus = bot.status === "starting";
  const isStoppingStatus = bot.status === "stopping";
  const isStarting = startBot.isPending && startBot.variables === bot.id;
  const isStopping = stopBot.isPending && stopBot.variables === bot.id;
  const isLoading = isStarting || isStopping || isStartingStatus || isStoppingStatus;
  const showStop = bot.status === "running" || bot.status === "stopping";
  const isEditable = bot.status === "stopped" || bot.status === "error";

  const gridConfig = bot.strategy === "grid" ? (bot.config as GridConfig) : null;
  const dcaConfig = bot.strategy === "dca" ? (bot.config as DCAConfig) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/dashboard/bots"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to My Bots
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{bot.name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
              {statusLabels[bot.status]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {bot.strategy === "grid" ? "Grid Trading" : "DCA"} • {bot.exchange} • {bot.symbol}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/bots/${bot.id}/edit`}
            className={`px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors ${
              isEditable ? "" : "pointer-events-none opacity-50"
            }`}
          >
            Edit Bot
          </Link>
          {showStop ? (
            <button
              onClick={() => stopBot.mutate(bot.id)}
              disabled={isLoading}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 flex items-center"
            >
              {(isStopping || isStoppingStatus) && <ButtonSpinner />}
              {isStopping || isStoppingStatus ? "Stopping..." : "Stop Bot"}
            </button>
          ) : (
            <button
              onClick={() => startBot.mutate(bot.id)}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
            >
              {(isStarting || isStartingStatus) && <ButtonSpinner />}
              {isStarting || isStartingStatus ? "Starting..." : "Start Bot"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : statsError ? (
          <div className="md:col-span-2 xl:col-span-4">
            <QueryError
              error={statsError}
              reset={() => refetchStats()}
              title="Failed to load bot stats"
            />
          </div>
        ) : (
          <>
            <StatCard
              title="Total P&L"
              value={formatCurrency(totalPnl)}
              valueClassName={pnlColor}
              subtitle={`${formatCurrency(bot.realized_pnl)} realized • ${formatCurrency(bot.unrealized_pnl)} unrealized`}
            />
            <StatCard
              title="Realized P&L"
              value={formatCurrency(bot.realized_pnl)}
              valueClassName={bot.realized_pnl >= 0 ? "text-green-500" : "text-red-500"}
              subtitle={`${formatCurrency(bot.unrealized_pnl)} unrealized`}
            />
            <StatCard
              title="Total Trades"
              value={String(stats?.trades?.total ?? 0)}
              subtitle={`${stats?.trades.buy_count ?? 0} buys • ${stats?.trades.sell_count ?? 0} sells`}
            />
            <StatCard
              title="Open Orders"
              value={String(stats?.orders?.open ?? 0)}
              subtitle={`${stats?.orders.filled ?? 0} filled • ${stats?.orders.cancelled ?? 0} cancelled`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Open Orders</h2>
            {openOrdersLoading ? (
              <InlineTableSkeleton rows={4} columns={5} />
            ) : openOrdersError ? (
              <QueryError
                error={openOrdersError}
                reset={() => refetchOpenOrders()}
                title="Failed to load open orders"
              />
            ) : !openOrders || openOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open orders for this bot yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2 text-left font-medium">Side</th>
                      <th className="py-2 text-right font-medium">Price</th>
                      <th className="py-2 text-right font-medium">Quantity</th>
                      <th className="py-2 text-right font-medium">Filled</th>
                      <th className="py-2 text-right font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              order.side === "buy"
                                ? "bg-green-500/15 text-green-500"
                                : "bg-red-500/15 text-red-500"
                            }`}
                          >
                            {order.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right">{formatCurrency(order.price)}</td>
                        <td className="py-3 text-right">{order.quantity.toFixed(6)}</td>
                        <td className="py-3 text-right">{order.filled_quantity.toFixed(6)}</td>
                        <td className="py-3 text-right text-muted-foreground">
                          {formatRelativeTime(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Trades</h2>
              <Link
                href="/dashboard/trades"
                className="text-sm text-primary hover:underline"
              >
                View all trades
              </Link>
            </div>
            {tradesLoading ? (
              <InlineTableSkeleton rows={4} columns={6} />
            ) : tradesError ? (
              <QueryError
                error={tradesError}
                reset={() => refetchTrades()}
                title="Failed to load trades"
              />
            ) : !trades || trades.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No trades recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2 text-left font-medium">Time</th>
                      <th className="py-2 text-left font-medium">Side</th>
                      <th className="py-2 text-right font-medium">Price</th>
                      <th className="py-2 text-right font-medium">Quantity</th>
                      <th className="py-2 text-right font-medium">Fee</th>
                      <th className="py-2 text-right font-medium">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b border-border last:border-0">
                        <td className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatRelativeTime(trade.timestamp)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(trade.timestamp)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              trade.side === "buy"
                                ? "bg-green-500/15 text-green-500"
                                : "bg-red-500/15 text-red-500"
                            }`}
                          >
                            {trade.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right">{formatCurrency(trade.price)}</td>
                        <td className="py-3 text-right">{trade.quantity.toFixed(6)}</td>
                        <td className="py-3 text-right text-muted-foreground">
                          {trade.fee.toFixed(6)} {trade.fee_currency}
                        </td>
                        <td className={`py-3 text-right ${trade.realized_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {trade.realized_pnl === 0
                            ? "-"
                            : `${trade.realized_pnl >= 0 ? "+" : ""}${formatCurrency(trade.realized_pnl)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {bot.strategy === "grid" && (
            <GridVisualization botId={bot.id} />
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Bot Overview</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Exchange</dt>
                <dd className="font-medium">{bot.exchange}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Symbol</dt>
                <dd className="font-medium">{bot.symbol}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Strategy</dt>
                <dd className="font-medium">
                  {bot.strategy === "grid" ? "Grid Trading" : "DCA"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">{formatDateTime(bot.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium">{formatDateTime(bot.updated_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Strategy Settings</h2>
            {bot.strategy === "grid" && gridConfig ? (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Lower Price</dt>
                  <dd className="font-medium">{formatCurrency(gridConfig.lower_price)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Upper Price</dt>
                  <dd className="font-medium">{formatCurrency(gridConfig.upper_price)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Grid Count</dt>
                  <dd className="font-medium">{gridConfig.grid_count}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Investment</dt>
                  <dd className="font-medium">{formatCurrency(gridConfig.investment)}</dd>
                </div>
              </dl>
            ) : dcaConfig ? (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Order Amount</dt>
                  <dd className="font-medium">{formatCurrency(dcaConfig.amount)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Interval</dt>
                  <dd className="font-medium">{dcaConfig.interval}</dd>
                </div>
                {dcaConfig.trigger_drop !== undefined && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Trigger Drop</dt>
                    <dd className="font-medium">{formatPercent(dcaConfig.trigger_drop)}</dd>
                  </div>
                )}
                {dcaConfig.take_profit !== undefined && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Take Profit</dt>
                    <dd className="font-medium">{formatPercent(dcaConfig.take_profit)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Strategy configuration not available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  valueClassName,
}: {
  title: string;
  value: string;
  subtitle?: string;
  valueClassName?: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${valueClassName ?? ""}`}>{value}</p>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
}

function BotDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <TableSkeleton rows={4} />
    </div>
  );
}

function InlineTableSkeleton({ rows, columns }: { rows: number; columns: number }) {
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  return (
    <div className="space-y-3">
      <div className="grid gap-3" style={gridStyle}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-3 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-3" style={gridStyle}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
