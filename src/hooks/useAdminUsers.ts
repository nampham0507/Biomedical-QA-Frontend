import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, Pagination, User } from "@/types";

interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface AdminUsersResult {
  users: User[];
  pagination: Pagination;
}

export function useAdminUsers(params: AdminUsersParams = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminUsersResult>>("/admin/users", { params });
      return data.data!;
    },
    placeholderData: (prev) => prev,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.patch(`/admin/users/${id}/status`, { isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: "user" | "admin" }) => {
      await api.patch(`/admin/users/${id}/role`, { role });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
