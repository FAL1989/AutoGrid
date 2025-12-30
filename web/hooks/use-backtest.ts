"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, BacktestResult } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useBacktests(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [...queryKeys.backtest.list(), params],
    queryFn: () => apiClient.listBacktests(params),
  });
}

export function useBacktest(id: string) {
  return useQuery({
    queryKey: queryKeys.backtest.detail(id),
    queryFn: () => apiClient.getBacktest(id),
    enabled: !!id,
  });
}

export function useRunBacktest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      strategy: string;
      symbol: string;
      timeframe: string;
      start_date: string;
      end_date: string;
      config: Record<string, unknown>;
    }): Promise<BacktestResult> => apiClient.runBacktest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtest.list() });
    },
  });
}
