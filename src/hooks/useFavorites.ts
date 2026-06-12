import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, Favorite, Pagination } from "@/types";

interface FavoritesParams {
  page?: number;
  limit?: number;
}

interface FavoritesResult {
  favorites: Favorite[];
  pagination: Pagination;
}

export function useFavorites(params: FavoritesParams = {}) {
  return useQuery({
    queryKey: ["favorites", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FavoritesResult>>("/favorites", { params });
      return data.data!;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { conversationId: string; note?: string }) => {
      const { data } = await api.post<ApiResponse<{ favorite: Favorite }>>("/favorites", payload);
      return data.data!.favorite;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useFavoriteStatus(conversationId?: string) {
  return useQuery({
    queryKey: ["favorite-status", conversationId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ isFavorite: boolean; favoriteId?: string }>>(
        `/favorites/check/${conversationId}`,
      );
      return data.data!;
    },
    enabled: !!conversationId,
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/favorites/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
