import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ExternalLink, Library } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import SearchInput from "@/components/shared/SearchInput";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useConversations } from "@/hooks/useConversations";
import { truncate } from "@/lib/utils";

interface DatasetGroup {
  name: string;
  citationCount: number;
  samples: { title: string; url?: string }[];
}

export default function KnowledgeBasePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const conversationsQuery = useConversations({ limit: 50 });

  const groups = useMemo<DatasetGroup[]>(() => {
    const conversations = conversationsQuery.data?.conversations ?? [];
    const map = new Map<string, DatasetGroup>();

    for (const conversation of conversations) {
      for (const source of conversation.sources) {
        const name = source.dataset || t.knowledgeBase.title;
        const group = map.get(name) ?? { name, citationCount: 0, samples: [] };
        group.citationCount += 1;
        if (group.samples.length < 3 && !group.samples.some((s) => s.title === source.title)) {
          group.samples.push({ title: source.title, url: source.url });
        }
        map.set(name, group);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.citationCount - a.citationCount);
  }, [conversationsQuery.data, t.knowledgeBase.title]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <PageContainer>
      <PageHeader title={t.knowledgeBase.title} description={t.knowledgeBase.description} />

      {!conversationsQuery.isLoading && groups.length > 0 && (
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t.knowledgeBase.searchPlaceholder}
          className="max-w-md"
        />
      )}

      {conversationsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t.knowledgeBase.empty}
          description={t.knowledgeBase.emptyDescription}
          action={
            <Button onClick={() => navigate("/app/ask")}>
              {t.knowledgeBase.askNow}
            </Button>
          }
        />
      ) : filteredGroups.length === 0 ? (
        <EmptyState icon={Library} title={t.common.noData} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <div
              key={group.name}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <p className="line-clamp-1 text-sm font-semibold text-gray-900">{group.name}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {group.citationCount} {t.knowledgeBase.citations}
                </Badge>
              </div>

              <div className="mt-4 flex-1 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t.knowledgeBase.sampleSources}
                </p>
                <ul className="space-y-1.5">
                  {group.samples.map((sample, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600">
                      <span className="line-clamp-1 flex-1">{truncate(sample.title, 60)}</span>
                      {sample.url && (
                        <a
                          href={sample.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-gray-400 transition-colors hover:text-primary-600"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
