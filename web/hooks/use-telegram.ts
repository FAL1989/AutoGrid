"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export function useTelegramLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.createTelegramLink(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telegram.link() });
    },
  });
}

export function useTelegramUnlink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.unlinkTelegram(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
}
