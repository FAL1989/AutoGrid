"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, Bot, BotCreate, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

interface UseBotParams {
  limit?: number;
  offset?: number;
  status?: string;
}

/**
 * Hook to fetch all bots
 */
export function useBots(params?: UseBotParams) {
  return useQuery({
    queryKey: queryKeys.bots.list(params),
    queryFn: () => apiClient.getBots(params),
  });
}

/**
 * Hook to fetch a single bot by ID
 */
export function useBot(id: string) {
  return useQuery({
    queryKey: queryKeys.bots.detail(id),
    queryFn: () => apiClient.getBot(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new bot
 */
export function useCreateBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BotCreate) => apiClient.createBot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.all });
    },
  });
}

/**
 * Hook to update a bot
 */
export function useUpdateBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ name: string; config: Bot["config"] }>;
    }) => apiClient.updateBot(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.lists() });
    },
  });
}

/**
 * Hook to delete a bot
 */
export function useDeleteBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.all });
    },
  });
}

/**
 * Hook to start a bot with optimistic update
 */
export function useStartBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.startBot(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bots.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.bots.lists() });

      // Snapshot previous value
      const previousBot = queryClient.getQueryData<Bot>(queryKeys.bots.detail(id));
      const previousBots = queryClient.getQueryData<Bot[]>(queryKeys.bots.lists());

      // Optimistically update bot status
      if (previousBot) {
        queryClient.setQueryData<Bot>(queryKeys.bots.detail(id), {
          ...previousBot,
          status: "starting",
        });
      }

      // Optimistically update bots list
      if (previousBots) {
        queryClient.setQueryData<Bot[]>(
          queryKeys.bots.lists(),
          previousBots.map((bot) =>
            bot.id === id ? { ...bot, status: "starting" } : bot
          )
        );
      }

      return { previousBot, previousBots };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousBot) {
        queryClient.setQueryData(queryKeys.bots.detail(id), context.previousBot);
      }
      if (context?.previousBots) {
        queryClient.setQueryData(queryKeys.bots.lists(), context.previousBots);
      }
    },
    onSettled: (_, __, id) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.lists() });
    },
  });
}

/**
 * Hook to stop a bot with optimistic update
 */
export function useStopBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.stopBot(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bots.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.bots.lists() });

      const previousBot = queryClient.getQueryData<Bot>(queryKeys.bots.detail(id));
      const previousBots = queryClient.getQueryData<Bot[]>(queryKeys.bots.lists());

      if (previousBot) {
        queryClient.setQueryData<Bot>(queryKeys.bots.detail(id), {
          ...previousBot,
          status: "stopping",
        });
      }

      if (previousBots) {
        queryClient.setQueryData<Bot[]>(
          queryKeys.bots.lists(),
          previousBots.map((bot) =>
            bot.id === id ? { ...bot, status: "stopping" } : bot
          )
        );
      }

      return { previousBot, previousBots };
    },
    onError: (err, id, context) => {
      if (context?.previousBot) {
        queryClient.setQueryData(queryKeys.bots.detail(id), context.previousBot);
      }
      if (context?.previousBots) {
        queryClient.setQueryData(queryKeys.bots.lists(), context.previousBots);
      }
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bots.lists() });
    },
  });
}

// Re-export ApiError for convenience
export { ApiError };
