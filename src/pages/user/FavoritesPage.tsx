import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, StickyNote } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import Pagination from "@/components/shared/Pagination";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useFavorites, useRemoveFavorite } from "@/hooks/useFavorites";
import { formatDate } from "@/lib/utils";

export default function FavoritesPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const favoritesQuery = useFavorites({ page, limit: 9 });
  const removeFavorite = useRemoveFavorite();

  const favorites = favoritesQuery.data?.favorites ?? [];
  const pagination = favoritesQuery.data?.pagination;

  return (
    <PageContainer>
      <PageHeader title={t.favorites.title} description={t.favorites.description} />

      {favoritesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState icon={Heart} title={t.favorites.empty} description={t.favorites.emptyDescription} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <div
              key={favorite._id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <p className="line-clamp-2 text-sm font-semibold text-gray-900">{favorite.conversationId.question}</p>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-500">{favorite.conversationId.answer}</p>

              {favorite.note && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary-50 p-2.5 text-xs text-secondary-700">
                  <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p className="line-clamp-2">{favorite.note}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">{formatDate(favorite.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate("/app/ask", { state: { loadConversationId: favorite.conversationId._id } })
                    }
                  >
                    {t.favorites.open}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRemoveId(favorite._id)}
                    className="text-secondary-600 hover:bg-danger-50 hover:text-danger-600"
                    title={t.conversation.removeFavorite}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
        open={!!removeId}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title={t.favorites.removeConfirm}
        onConfirm={() => {
          if (removeId) removeFavorite.mutate(removeId);
          setRemoveId(null);
        }}
      />
    </PageContainer>
  );
}
