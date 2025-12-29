"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, Order } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

interface UseOrdersParams {
  status?: string;
  limit?: number;
}

/**
 * Hook to fetch orders for a specific bot
 */
export function useOrders(botId: string, params?: UseOrdersParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(botId, params),
    queryFn: () => apiClient.getOrders(botId, params),
    enabled: !!botId,
  });
}

/**
 * Hook to fetch open orders for a specific bot
 * Polls every 10 seconds for real-time updates
 */
export function useOpenOrders(botId: string, polling = true) {
  return useQuery({
    queryKey: queryKeys.orders.open(botId),
    queryFn: () => apiClient.getOpenOrders(botId),
    enabled: !!botId,
    refetchInterval: polling ? 10000 : false, // Poll every 10 seconds if enabled
  });
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ botId, orderId }: { botId: string; orderId: string }) =>
      apiClient.cancelOrder(botId, orderId),
    onMutate: async ({ botId, orderId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.byBot(botId) });

      // Snapshot previous orders
      const previousOrders = queryClient.getQueryData<Order[]>(
        queryKeys.orders.open(botId)
      );

      // Optimistically remove the cancelled order
      if (previousOrders) {
        queryClient.setQueryData<Order[]>(
          queryKeys.orders.open(botId),
          previousOrders.filter((order) => order.id !== orderId)
        );
      }

      return { previousOrders };
    },
    onError: (_, { botId }, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(
          queryKeys.orders.open(botId),
          context.previousOrders
        );
      }
    },
    onSettled: (_, __, { botId }) => {
      // Refetch orders to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.byBot(botId) });
    },
  });
}

/**
 * Hook to get order statistics for a bot
 */
export function useOrderStats(botId: string) {
  return useQuery({
    queryKey: queryKeys.stats.bot(botId),
    queryFn: () => apiClient.getBotStatistics(botId),
    enabled: !!botId,
  });
}
