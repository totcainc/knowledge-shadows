import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shadowsApi, chaptersApi, decisionPointsApi } from './shadows';
import type { CreateShadowRequest, UpdateShadowRequest } from './types';

// Query keys
export const queryKeys = {
  shadows: ['shadows'] as const,
  shadow: (id: string) => ['shadow', id] as const,
  chapters: (shadowId: string) => ['chapters', shadowId] as const,
  decisionPoints: (shadowId: string) => ['decisionPoints', shadowId] as const,
};

// Shadow hooks
export function useShadows() {
  return useQuery({
    queryKey: queryKeys.shadows,
    queryFn: () => shadowsApi.list(),
  });
}

export function useShadow(shadowId: string, options?: { pollWhileProcessing?: boolean }) {
  return useQuery({
    queryKey: queryKeys.shadow(shadowId),
    queryFn: () => shadowsApi.get(shadowId),
    enabled: !!shadowId,
    refetchInterval: (query) => {
      // Poll every 3 seconds while processing
      if (options?.pollWhileProcessing && query.state.data?.status === 'processing') {
        return 3000;
      }
      return false;
    },
  });
}

export function useStartCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShadowRequest) => shadowsApi.startCapture(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shadows });
    },
  });
}

export function useEndCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shadowId: string) => shadowsApi.endCapture(shadowId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shadows });
      queryClient.invalidateQueries({ queryKey: queryKeys.shadow(data.id) });
    },
  });
}

export function useUpdateShadow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shadowId, data }: { shadowId: string; data: UpdateShadowRequest }) =>
      shadowsApi.update(shadowId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shadows });
      queryClient.invalidateQueries({ queryKey: queryKeys.shadow(data.id) });
    },
  });
}

export function useDeleteShadow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shadowId: string) => shadowsApi.delete(shadowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shadows });
    },
  });
}

export function useRetryProcessing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shadowId: string) => shadowsApi.retryProcessing(shadowId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shadows });
      queryClient.invalidateQueries({ queryKey: queryKeys.shadow(data.id) });
    },
  });
}

// Chapter hooks
export function useChapters(shadowId: string) {
  return useQuery({
    queryKey: queryKeys.chapters(shadowId),
    queryFn: () => chaptersApi.getByShadow(shadowId),
    enabled: !!shadowId,
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: { title?: string; user_notes?: string } }) =>
      chaptersApi.update(chapterId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters(data.shadow_id) });
    },
  });
}

// Decision point hooks
export function useDecisionPoints(shadowId: string) {
  return useQuery({
    queryKey: queryKeys.decisionPoints(shadowId),
    queryFn: () => decisionPointsApi.getByShadow(shadowId),
    enabled: !!shadowId,
  });
}

export function useVerifyDecisionPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (decisionPointId: string) => decisionPointsApi.verify(decisionPointId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisionPoints(data.shadow_id) });
    },
  });
}
