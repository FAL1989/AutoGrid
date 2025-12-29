"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, Bot, Trade } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

interface UseTradesParams {
  limit?: number;
  offset?: number;
}

interface TradesHistoryParams {
  limit?: number;
  botId?: string;
  side?: "buy" | "sell";
}

export interface TradeWithBot extends Trade {
  botName: string;
}

export interface TradesHistoryData {
  bots: Bot[];
  trades: TradeWithBot[];
}

/**
 * Hook to fetch trades for a specific bot
 */
export function useTrades(botId: string, params?: UseTradesParams) {
  return useQuery({
    queryKey: queryKeys.trades.list(botId, params),
    queryFn: () => apiClient.getTrades(botId, params),
    enabled: !!botId,
  });
}

/**
 * Hook to fetch recent trades across all bots
 * Used for dashboard display
 */
export function useRecentTrades(limit = 10) {
  return useQuery({
    queryKey: queryKeys.trades.recent(),
    queryFn: async () => {
      // Get all bots first, then aggregate recent trades
      const bots = await apiClient.getBots();
      const tradesPromises = bots.map((bot) =>
        apiClient.getTrades(bot.id, { limit: 5 }).catch(() => [] as Trade[])
      );

      const allTrades = await Promise.all(tradesPromises);
      const flatTrades = allTrades.flat();

      // Sort by timestamp descending and take top N
      return flatTrades
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch bot statistics
 */
export function useBotStatistics(botId: string) {
  return useQuery({
    queryKey: queryKeys.stats.bot(botId),
    queryFn: () => apiClient.getBotStatistics(botId),
    enabled: !!botId,
  });
}

/**
 * Hook to fetch aggregated trade history across bots
 */
export function useTradesHistory(params?: TradesHistoryParams) {
  return useQuery({
    queryKey: queryKeys.trades.history(params),
    queryFn: async (): Promise<TradesHistoryData> => {
      const limit = params?.limit ?? 50;
      const bots = await apiClient.getBots();

      if (bots.length === 0) {
        return { bots, trades: [] };
      }

      let trades: TradeWithBot[] = [];

      if (params?.botId) {
        const botTrades = await apiClient.getTrades(params.botId, { limit });
        const botName = bots.find((bot) => bot.id === params.botId)?.name ?? "Unknown";
        trades = botTrades.map((trade) => ({
          ...trade,
          botName,
        }));
      } else {
        const tradesByBot = await Promise.all(
          bots.map(async (bot) => {
            const botTrades = await apiClient.getTrades(bot.id, { limit });
            return botTrades.map((trade) => ({
              ...trade,
              botName: bot.name,
            }));
          })
        );

        trades = tradesByBot.flat();
      }

      if (params?.side) {
        trades = trades.filter((trade) => trade.side === params.side);
      }

      trades.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return { bots, trades: trades.slice(0, limit) };
    },
    staleTime: 30000,
  });
}
