import { useQuery } from "@tanstack/react-query";
import { apiClient, Trade } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

interface UseTradesParams {
  limit?: number;
  offset?: number;
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
