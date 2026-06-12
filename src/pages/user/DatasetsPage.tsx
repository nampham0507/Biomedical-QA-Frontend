import { useState } from "react";
import { Plus, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StatusBadge from "@/components/shared/StatusBadge";
import FileDropzone from "@/components/shared/FileDropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/stores/auth.store";
import { useDatasets, useDeleteDataset, useReindexDataset, useUploadDataset } from "@/hooks/useDatasets";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Dataset } from "@/types";

export default function DatasetsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [page, setPage] = useState(1);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const datasetsQuery = useDatasets({ page, limit: 10 });
  const uploadMutation = useUploadDataset();
  const deleteMutation = useDeleteDataset();
  const reindexMutation = useReindexDataset();

  if (!isAdmin) {
    return (
      <PageContainer>
        <PageHeader title={t.dataset.title} description={t.dataset.manageDescription} />
        <EmptyState icon={ShieldAlert} title={t.dataset.restricted} description={t.dataset.restrictedDescription} />
      </PageContainer>
    );
  }

  const datasets = datasetsQuery.data?.datasets ?? [];
  const pagination = datasetsQuery.data?.pagination;

  async function handleUpload() {
    if (!uploadFile) return;
    try {
      await uploadMutation.mutateAsync({ file: uploadFile, name: datasetName.trim() || undefined });
      toast({ description: t.dataset.uploadSuccess });
      setUploadFile(null);
      setDatasetName("");
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  async function handleReindex(id: string) {
    try {
      await reindexMutation.mutateAsync(id);
      toast({ description: t.dataset.reindexSuccess });
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({ description: t.dataset.deleteSuccess });
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  const columns: DataTableColumn<Dataset>[] = [
    {
      key: "name",
      header: t.dataset.name,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          {row.description && <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{row.description}</p>}
        </div>
      ),
    },
    {
      key: "type",
      header: t.dataset.type,
      cell: (row) => <span className="font-mono text-xs uppercase text-gray-500">{row.type}</span>,
      className: "w-24",
    },
    {
      key: "size",
      header: t.dataset.size,
      cell: (row) => (row.fileSize != null ? formatBytes(row.fileSize) : "—"),
      className: "w-28",
    },
    {
      key: "documents",
      header: t.dataset.documents,
      cell: (row) => row.documentCount ?? "—",
      className: "w-28",
    },
    {
      key: "status",
      header: t.common.status,
      cell: (row) => <StatusBadge status={row.status} label={t.admin[row.status]} />,
      className: "w-32",
    },
    {
      key: "indexedAt",
      header: t.dataset.indexedAt,
      cell: (row) => (row.indexedAt ? formatDate(row.indexedAt) : "—"),
      className: "w-44",
    },
    {
      key: "actions",
      header: t.common.actions,
      cell: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleReindex(row._id)}
            title={t.admin.reindex}
            disabled={row.status === "processing"}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row._id)}
            title={t.common.delete}
            className="text-gray-400 hover:text-danger-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <PageContainer>
      <PageHeader title={t.dataset.title} description={t.dataset.manageDescription} />

      <FileDropzone
        onFileSelect={setUploadFile}
        accept=".pdf,.txt,.json,.csv"
        className={uploadMutation.isPending ? "pointer-events-none opacity-60" : undefined}
      />

      <DataTable
        columns={columns}
        data={datasets}
        isLoading={datasetsQuery.isLoading}
        rowKey={(row) => row._id}
        emptyTitle={t.dataset.empty}
        emptyDescription={t.dataset.emptyDescription}
      />

      {pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      )}

      <Dialog open={!!uploadFile} onOpenChange={(open) => !open && setUploadFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.admin.uploadDataset}</DialogTitle>
            <DialogDescription>{uploadFile?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="dataset-name">{t.dataset.name}</Label>
            <Input
              id="dataset-name"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder={t.dataset.namePlaceholder}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadFile(null)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
              <Plus className="h-4 w-4" />
              {t.admin.uploadDataset}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.dataset.deleteConfirm}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
