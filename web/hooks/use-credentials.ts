import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ExchangeCredential, ExchangeCredentialCreate } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

/**
 * Hook to fetch all exchange credentials
 */
export function useCredentials() {
  return useQuery({
    queryKey: queryKeys.credentials.list(),
    queryFn: () => apiClient.getCredentials(),
  });
}

/**
 * Hook to fetch a single credential by ID
 */
export function useCredential(id: string) {
  return useQuery({
    queryKey: queryKeys.credentials.detail(id),
    queryFn: () => apiClient.getCredential(id),
    enabled: !!id,
  });
}

/**
 * Hook to add a new exchange credential
 */
export function useAddCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExchangeCredentialCreate) => apiClient.addCredential(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
    },
  });
}

/**
 * Hook to delete an exchange credential
 */
export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCredential(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.credentials.list() });

      const previousCredentials = queryClient.getQueryData<ExchangeCredential[]>(
        queryKeys.credentials.list()
      );

      if (previousCredentials) {
        queryClient.setQueryData<ExchangeCredential[]>(
          queryKeys.credentials.list(),
          previousCredentials.filter((cred) => cred.id !== id)
        );
      }

      return { previousCredentials };
    },
    onError: (_, __, context) => {
      if (context?.previousCredentials) {
        queryClient.setQueryData(
          queryKeys.credentials.list(),
          context.previousCredentials
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credentials.all });
    },
  });
}

/**
 * Hook to refresh markets for a credential
 */
export function useRefreshMarkets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) => apiClient.refreshMarkets(credentialId),
    onSuccess: (_, credentialId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.credentials.markets(credentialId),
      });
    },
  });
}

/**
 * Hook to get available markets for a credential
 */
export function useMarkets(credentialId: string) {
  return useQuery({
    queryKey: queryKeys.credentials.markets(credentialId),
    queryFn: async () => {
      const result = await apiClient.refreshMarkets(credentialId);
      return result.markets;
    },
    enabled: !!credentialId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
