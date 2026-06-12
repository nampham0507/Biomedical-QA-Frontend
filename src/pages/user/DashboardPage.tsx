import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Heart, MessageSquare, Sparkles } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import StatCard from "@/components/shared/StatCard";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useConversations } from "@/hooks/useConversations";
import { useFavorites } from "@/hooks/useFavorites";
import { formatDate, truncate } from "@/lib/utils";
import type { Conversation } from "@/types";

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  const conversationsQuery = useConversations({ limit: 5 });
  const favoritesQuery = useFavorites({ limit: 3 });

  const conversations = conversationsQuery.data?.conversations ?? [];
  const avgResponseTime = conversations.length
    ? Math.round(conversations.reduce((sum, c) => sum + (c.processingTime ?? 0), 0) / conversations.length)
    : 0;

  function handleHeroSubmit() {
    const trimmed = question.trim();
    if (!trimmed) return;
    navigate("/app/ask", { state: { initialQuestion: trimmed } });
  }

  const columns: DataTableColumn<Conversation>[] = [
    {
      key: "question",
      header: t.qa.title,
      cell: (row) => <span className="font-medium text-gray-900">{truncate(row.question, 70)}</span>,
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

  return (
    <PageContainer>
      <div>
        <p className="text-sm text-gray-500">{t.dashboard.welcomeBack}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{user?.fullName}</h1>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white shadow-elevated md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <h2 className="text-xl font-semibold md:text-2xl">{t.dashboard.heroTitle}</h2>
          <p className="mt-1 text-sm text-primary-100">{t.dashboard.heroDescription}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-200" />
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroSubmit()}
                placeholder={t.qa.placeholder}
                className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-primary-100 focus:border-white/40 focus:outline-none"
              />
            </div>
            <Button onClick={handleHeroSubmit} variant="secondary" className="shrink-0">
              {t.dashboard.heroCta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t.dashboard.statQuestions} value={conversationsQuery.data?.pagination.total ?? 0} icon={MessageSquare} />
        <StatCard label={t.dashboard.statFavorites} value={favoritesQuery.data?.pagination.total ?? 0} icon={Heart} />
        <StatCard label={t.dashboard.statAvgResponse} value={`${avgResponseTime} ${t.qa.ms}`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-base font-semibold text-gray-900">{t.dashboard.recentConversations}</h3>
          <DataTable
            columns={columns}
            data={conversations}
            isLoading={conversationsQuery.isLoading}
            rowKey={(row) => row._id}
            emptyTitle={t.conversation.empty}
            emptyDescription={t.dashboard.noConversationsDesc}
            onRowClick={(row) => navigate("/app/ask", { state: { loadConversationId: row._id } })}
          />
        </div>
        <div>
          <h3 className="mb-3 text-base font-semibold text-gray-900">{t.dashboard.savedInsights}</h3>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-ambient">
            {favoritesQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : favoritesQuery.data?.favorites.length ? (
              <div className="flex flex-col gap-3">
                {favoritesQuery.data.favorites.map((favorite) => (
                  <div key={favorite._id} className="rounded-lg border border-gray-100 p-3">
                    <p className="line-clamp-1 text-sm font-medium text-gray-900">{favorite.conversationId.question}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{favorite.conversationId.answer}</p>
                    <button
                      onClick={() =>
                        navigate("/app/ask", { state: { loadConversationId: favorite.conversationId._id } })
                      }
                      className="mt-2 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
                    >
                      {t.favorites.open}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Heart} title={t.favorites.empty} description={t.dashboard.noFavoritesDesc} className="py-8" />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
