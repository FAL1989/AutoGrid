"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => apiClient.getMe(),
  });
}
