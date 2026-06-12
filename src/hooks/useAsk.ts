import { useMutation } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, AskResult } from "@/types";

interface AskPayload {
  question: string;
  sessionId?: string;
}

export function useAsk() {
  return useMutation({
    mutationFn: async (payload: AskPayload) => {
      const { data } = await api.post<ApiResponse<AskResult>>("/qa/ask", payload);
      return data.data!;
    },
  });
}
