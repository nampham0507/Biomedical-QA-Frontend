import { useState } from "react";
import { Trash2 } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import SearchInput from "@/components/shared/SearchInput";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminUsers, useDeleteUser, useUpdateUserRole, useUpdateUserStatus } from "@/hooks/useAdminUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate, getInitials } from "@/lib/utils";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);
  const usersQuery = useAdminUsers({ page, limit: 10, search: debouncedSearch || undefined });
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const users = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;

  async function handleStatusChange(id: string, isActive: boolean) {
    try {
      await updateStatus.mutateAsync({ id, isActive });
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  async function handleRoleChange(id: string, role: "user" | "admin") {
    try {
      await updateRole.mutateAsync({ id, role });
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteUser.mutateAsync(deleteId);
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: "user",
      header: t.auth.fullName,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials(row.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-gray-900">{row.fullName}</p>
              {row._id === currentUser?._id && (
                <Badge variant="outline" className="shrink-0">
                  {t.admin.you}
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: t.admin.role,
      cell: (row) => (
        <Select
          value={row.role}
          disabled={row._id === currentUser?._id || updateRole.isPending}
          onChange={(e) => handleRoleChange(row._id, e.target.value as "user" | "admin")}
          className="h-9 w-32"
        >
          <option value="user">{t.admin.users}</option>
          <option value="admin">{t.nav.admin}</option>
        </Select>
      ),
      className: "w-40",
    },
    {
      key: "status",
      header: t.common.status,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.isActive}
            disabled={row._id === currentUser?._id || updateStatus.isPending}
            onCheckedChange={(checked) => handleStatusChange(row._id, checked)}
            aria-label={row.isActive ? t.admin.deactivate : t.admin.activate}
          />
          <span className="text-xs text-gray-500">{row.isActive ? t.admin.active : t.admin.inactive}</span>
        </div>
      ),
      className: "w-36",
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
        <Button
          variant="ghost"
          size="icon"
          disabled={row._id === currentUser?._id}
          onClick={() => setDeleteId(row._id)}
          title={t.admin.deleteUser}
          className="text-gray-400 hover:text-danger-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
      className: "w-20",
    },
  ];

  return (
    <PageContainer>
      <PageHeader title={t.admin.users} description={t.admin.manageUsersDescription} />

      <SearchInput
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder={t.admin.searchUsers}
        className="max-w-md"
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={usersQuery.isLoading}
        rowKey={(row) => row._id}
        emptyTitle={t.admin.noUsers}
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
        title={t.admin.deleteUser}
        description={t.admin.confirmDeleteUser}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}
