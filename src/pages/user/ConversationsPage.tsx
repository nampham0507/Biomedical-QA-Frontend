import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import SearchInput from "@/components/shared/SearchInput";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useConversations, useDeleteAllConversations, useDeleteConversation } from "@/hooks/useConversations";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate, truncate } from "@/lib/utils";
import type { Conversation } from "@/types";

export default function ConversationsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const debouncedSearch = useDebounce(search);
  const conversationsQuery = useConversations({ page, limit: 10, search: debouncedSearch || undefined });
  const deleteMutation = useDeleteConversation();
  const deleteAllMutation = useDeleteAllConversations();

  const conversations = conversationsQuery.data?.conversations ?? [];
  const pagination = conversationsQuery.data?.pagination;

  function handleOpen(id: string) {
    navigate("/app/ask", { state: { loadConversationId: id } });
  }

  const columns: DataTableColumn<Conversation>[] = [
    {
      key: "question",
      header: t.qa.title,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{truncate(row.question, 70)}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{truncate(row.answer, 100)}</p>
        </div>
      ),
    },
    {
      key: "sources",
      header: t.qa.sources,
      cell: (row) => row.sources.length,
      className: "w-24",
    },
    {
      key: "createdAt",
      header: t.common.createdAt,
      cell: (row) => <span className="text-gray-500">{formatDate(row.createdAt)}</span>,
      className: "w-44",
    },
    {
      key: "actions",
      header: t.common.actions,
      cell: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => handleOpen(row._id)} title={t.conversation.view}>
            <Eye className="h-4 w-4" />
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
      className: "w-28",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t.conversation.title}
        description={t.conversation.description}
        actions={
          conversations.length > 0 && (
            <Button variant="destructive" onClick={() => setDeleteAllOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t.conversation.deleteAll}
            </Button>
          )
        }
      />

      <SearchInput
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder={t.conversation.searchPlaceholder}
        className="max-w-md"
      />

      <DataTable
        columns={columns}
        data={conversations}
        isLoading={conversationsQuery.isLoading}
        rowKey={(row) => row._id}
        emptyTitle={t.conversation.empty}
        emptyDescription={t.conversation.emptyDescription}
        onRowClick={(row) => handleOpen(row._id)}
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.conversation.deleteConfirm}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        title={t.conversation.deleteAll}
        description={t.conversation.deleteAllConfirm}
        onConfirm={() => {
          deleteAllMutation.mutate();
          setDeleteAllOpen(false);
        }}
      />
    </PageContainer>
  );
}
