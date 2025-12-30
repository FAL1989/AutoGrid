"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useBotPerformanceReport() {
  return useQuery({
    queryKey: queryKeys.reports.bots(),
    queryFn: () => apiClient.getBotPerformanceReport(),
  });
}

export function useStrategyComparisonReport() {
  return useQuery({
    queryKey: queryKeys.reports.strategies(),
    queryFn: () => apiClient.getStrategyComparisonReport(),
  });
}
