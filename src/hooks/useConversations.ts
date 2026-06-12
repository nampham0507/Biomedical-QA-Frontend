import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, Conversation, Pagination } from "@/types";

interface ConversationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface ConversationsResult {
  conversations: Conversation[];
  pagination: Pagination;
}

export function useConversations(params: ConversationsParams = {}) {
  return useQuery({
    queryKey: ["conversations", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ConversationsResult>>("/conversations", { params });
      return data.data!;
    },
    placeholderData: (prev) => prev,
  });
}

export function useConversation(id?: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ conversation: Conversation }>>(`/conversations/${id}`);
      return data.data!.conversation;
    },
    enabled: !!id,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteAllConversations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete("/conversations/all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
