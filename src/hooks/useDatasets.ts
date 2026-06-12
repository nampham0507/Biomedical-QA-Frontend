import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import type { ApiResponse, Dataset, Pagination } from "@/types";

interface DatasetsParams {
  page?: number;
  limit?: number;
}

interface DatasetsResult {
  datasets: Dataset[];
  pagination: Pagination;
  vectorStoreCount: number;
}

export function useDatasets(params: DatasetsParams = {}) {
  return useQuery({
    queryKey: ["datasets", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DatasetsResult>>("/datasets", { params });
      return data.data!;
    },
    placeholderData: (prev) => prev,
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, name }: { file: File; name?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (name) formData.append("name", name);
      const { data } = await api.post<ApiResponse<{ dataset: Dataset }>>("/datasets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data!.dataset;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/datasets/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
  });
}

export function useReindexDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/datasets/${id}/reindex`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
  });
}
