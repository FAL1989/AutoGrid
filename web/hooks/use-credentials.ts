"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ExchangeCredentialCreate } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

/**
 * Hook to fetch exchange credentials
 */
export function useCredentials() {
  return useQuery({
    queryKey: queryKeys.credentials.list(),
    queryFn: () => apiClient.getCredentials(),
  });
}

/**
 * Hook to fetch a single credential
 */
export function useCredential(id: string) {
  return useQuery({
    queryKey: queryKeys.credentials.detail(id),
    queryFn: () => apiClient.getCredential(id),
    enabled: !!id,
  });
}

/**
 * Hook to create new exchange credential
 */
export function useCreateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExchangeCredentialCreate) => apiClient.addCredential(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
    },
  });
}

/**
 * Hook to delete credential
 */
export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
    },
  });
}

/**
 * Hook to fetch available markets for a credential
 */
export function useCredentialMarkets(credentialId: string) {
  return useQuery({
    queryKey: queryKeys.credentials.markets(credentialId),
    queryFn: () => apiClient.refreshMarkets(credentialId),
    enabled: !!credentialId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
