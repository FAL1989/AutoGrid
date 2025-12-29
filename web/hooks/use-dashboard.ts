"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, Bot, DashboardStats } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

/**
 * Hook to fetch aggregated dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard(),
    queryFn: async (): Promise<DashboardStats> => {
      // Get all bots
      const bots = await apiClient.getBots();

      // Get statistics for each running bot
      const statsPromises = bots
        .filter((bot) => bot.status === "running" || bot.realized_pnl !== 0)
        .map((bot) =>
          apiClient.getBotStatistics(bot.id).catch(() => ({
            orders: { total: 0, open: 0, filled: 0, cancelled: 0 },
            trades: { total: 0, buy_count: 0, sell_count: 0, total_volume: 0 },
          }))
        );

      const allStats = await Promise.all(statsPromises);

      // Aggregate stats
      const totalTrades = allStats.reduce(
        (sum, stat) => sum + stat.trades.total,
        0
      );
      const totalVolume = allStats.reduce(
        (sum, stat) => sum + stat.trades.total_volume,
        0
      );
      const totalPnl = bots.reduce(
        (sum, bot) => sum + bot.realized_pnl + bot.unrealized_pnl,
        0
      );
      const activeBots = bots.filter((bot) => bot.status === "running").length;

      // Calculate win rate (trades with positive realized_pnl)
      const winningBots = bots.filter((bot) => bot.realized_pnl > 0).length;
      const botsWithTrades = bots.filter(
        (bot) => bot.realized_pnl !== 0 || bot.unrealized_pnl !== 0
      ).length;
      const winRate =
        botsWithTrades > 0 ? (winningBots / botsWithTrades) * 100 : 0;

      return {
        total_pnl: totalPnl,
        active_bots: activeBots,
        total_trades: totalTrades,
        win_rate: winRate,
        total_volume: totalVolume,
      };
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch P&L data for chart
 */
export function usePnLChartData() {
  return useQuery({
    queryKey: [...queryKeys.stats.dashboard(), "pnl-chart"],
    queryFn: async () => {
      const bots = await apiClient.getBots();

      // Get trades for each bot to build P&L timeline
      const tradesPromises = bots.map(async (bot) => {
        try {
          const trades = await apiClient.getTrades(bot.id, { limit: 100 });
          return trades.map((trade) => ({
            timestamp: trade.timestamp,
            pnl: trade.realized_pnl,
            botName: bot.name,
          }));
        } catch {
          return [];
        }
      });

      const allTrades = (await Promise.all(tradesPromises)).flat();

      // Sort by timestamp
      allTrades.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Calculate cumulative P&L
      let cumulativePnl = 0;
      return allTrades.map((trade) => {
        cumulativePnl += trade.pnl;
        return {
          date: new Date(trade.timestamp).toLocaleDateString(),
          pnl: cumulativePnl,
        };
      });
    },
    staleTime: 60000,
  });
}

/**
 * Hook to get quick bot summary
 */
export function useBotsSummary() {
  return useQuery({
    queryKey: [...queryKeys.bots.lists(), "summary"],
    queryFn: async () => {
      const bots = await apiClient.getBots();

      return {
        total: bots.length,
        running: bots.filter((b) => b.status === "running").length,
        stopped: bots.filter((b) => b.status === "stopped").length,
        error: bots.filter((b) => b.status === "error").length,
        byStrategy: {
          grid: bots.filter((b) => b.strategy === "grid").length,
          dca: bots.filter((b) => b.strategy === "dca").length,
        },
        byExchange: bots.reduce(
          (acc, bot) => {
            acc[bot.exchange] = (acc[bot.exchange] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      };
    },
    staleTime: 30000,
  });
}
