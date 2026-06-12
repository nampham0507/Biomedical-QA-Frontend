import { useMutation } from "@tanstack/react-query";
import api from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse, User } from "@/types";

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: { fullName: string }) => {
      const { data } = await api.patch<ApiResponse<{ user: User }>>("/users/profile", payload);
      return data.data!.user;
    },
    onSuccess: (user) => setUser(user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      await api.post("/users/change-password", payload);
    },
  });
}
