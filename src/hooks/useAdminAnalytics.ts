import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse } from "@/types";

interface OverviewData {
  totals: {
    users: number;
    conversations: number;
    datasets: number;
    favorites: number;
    vectorDocuments: number;
  };
  last30Days: {
    newUsers: number;
    newConversations: number;
  };
}

export interface ActivityPoint {
  _id: string;
  count: number;
  avgTokens?: number;
  avgProcessingTime?: number;
}

interface ActivityData {
  conversations: ActivityPoint[];
  users: ActivityPoint[];
}

export interface TopUser {
  _id: string;
  fullName: string;
  email: string;
  conversationCount: number;
  totalTokens: number;
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OverviewData>>("/admin/analytics/overview");
      return data.data!;
    },
  });
}

export function useAnalyticsActivity(days = 7) {
  return useQuery({
    queryKey: ["admin", "analytics", "activity", days],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ActivityData>>("/admin/analytics/activity", {
        params: { days },
      });
      return data.data!;
    },
  });
}

export function useTopUsers() {
  return useQuery({
    queryKey: ["admin", "analytics", "top-users"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ topUsers: TopUser[] }>>("/admin/analytics/top-users");
      return data.data!.topUsers;
    },
  });
}
