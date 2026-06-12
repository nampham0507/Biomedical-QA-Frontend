import { BookOpen, ExternalLink } from "lucide-react";
import type { Source } from "@/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

interface CitationCardProps {
  source: Source;
  index?: number;
  className?: string;
}

export default function CitationCard({ source, index, className }: CitationCardProps) {
  const { t } = useI18n();

  return (
    <div className={cn("citation-block flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1.5 text-sm font-medium text-secondary-700">
        <BookOpen className="h-4 w-4" />
        {source.title || `${t.qa.sources} ${index !== undefined ? index + 1 : ""}`}
      </div>
      <p className="line-clamp-3 text-sm text-gray-600">{source.content}</p>
      <div className="flex items-center justify-between border-t border-secondary-100 pt-2 text-xs text-gray-400">
        <span>
          {source.dataset && <span className="font-mono">{source.dataset}</span>}
          {source.dataset && " · "}
          {t.qa.relevanceScore}: {(source.score * 100).toFixed(0)}%
        </span>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 transition-colors hover:text-primary-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
