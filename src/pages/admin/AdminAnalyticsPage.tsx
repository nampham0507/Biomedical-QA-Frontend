import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Database, FileText, MessagesSquare, Users } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import LoadingState from "@/components/shared/LoadingState";
import { useI18n } from "@/i18n";
import { useAnalyticsActivity, useAnalyticsOverview, useTopUsers, type TopUser } from "@/hooks/useAdminAnalytics";
import { useConversations } from "@/hooks/useConversations";
import { formatDate, truncate } from "@/lib/utils";
import type { Conversation } from "@/types";

export default function AdminAnalyticsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const overviewQuery = useAnalyticsOverview();
  const activityQuery = useAnalyticsActivity(7);
  const topUsersQuery = useTopUsers();
  const recentConversationsQuery = useConversations({ limit: 5 });

  const chartData = useMemo(() => {
    const conversations = activityQuery.data?.conversations ?? [];
    const users = activityQuery.data?.users ?? [];
    const dates = Array.from(new Set([...conversations.map((d) => d._id), ...users.map((d) => d._id)])).sort();

    return dates.map((date) => ({
      date,
      conversations: conversations.find((d) => d._id === date)?.count ?? 0,
      users: users.find((d) => d._id === date)?.count ?? 0,
    }));
  }, [activityQuery.data]);

  const overview = overviewQuery.data;
  const recentConversations = recentConversationsQuery.data?.conversations ?? [];

  const topUserColumns: DataTableColumn<TopUser>[] = [
    {
      key: "user",
      header: t.auth.fullName,
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.fullName}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "conversations",
      header: t.nav.conversations,
      cell: (row) => row.conversationCount,
      className: "w-32",
    },
    {
      key: "tokens",
      header: t.qa.tokensUsed,
      cell: (row) => row.totalTokens.toLocaleString(),
      className: "w-32",
    },
  ];

  const conversationColumns: DataTableColumn<Conversation>[] = [
    {
      key: "question",
      header: t.qa.title,
      cell: (row) => <p className="line-clamp-1 font-medium text-gray-900">{truncate(row.question, 60)}</p>,
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
  ];

  if (overviewQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={t.admin.analytics} description={t.admin.analyticsDescription} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.admin.totalUsers} value={overview?.totals.users ?? 0} icon={Users} />
        <StatCard
          label={t.admin.totalConversations}
          value={overview?.totals.conversations ?? 0}
          icon={MessagesSquare}
        />
        <StatCard label={t.admin.totalDatasets} value={overview?.totals.datasets ?? 0} icon={Database} />
        <StatCard
          label={t.admin.vectorDocuments}
          value={overview?.totals.vectorDocuments ?? 0}
          icon={FileText}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.admin.activityChart}</CardTitle>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              {t.admin.newUsers} ({t.admin.last30Days}):{" "}
              <span className="font-semibold text-gray-900">{overview?.last30Days.newUsers ?? 0}</span>
            </span>
            <span>
              {t.admin.newConversations} ({t.admin.last30Days}):{" "}
              <span className="font-semibold text-gray-900">{overview?.last30Days.newConversations ?? 0}</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="conversations"
                name={t.admin.totalConversations}
                stroke="#2563eb"
                fill="url(#colorConversations)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="users"
                name={t.admin.newUsers}
                stroke="#0d9488"
                fill="url(#colorUsers)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">{t.admin.topUsers}</h2>
          <DataTable
            columns={topUserColumns}
            data={topUsersQuery.data ?? []}
            isLoading={topUsersQuery.isLoading}
            rowKey={(row) => row._id}
            emptyTitle={t.common.noData}
          />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">{t.dashboard.recentConversations}</h2>
          <DataTable
            columns={conversationColumns}
            data={recentConversations}
            isLoading={recentConversationsQuery.isLoading}
            rowKey={(row) => row._id}
            emptyTitle={t.conversation.empty}
            onRowClick={(row) => navigate(`/admin/analysis/${row._id}`)}
          />
        </div>
      </div>
    </PageContainer>
  );
}
