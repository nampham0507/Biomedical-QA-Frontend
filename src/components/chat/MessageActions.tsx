import { useState } from "react";
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

interface MessageActionsProps {
  content: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onRegenerate?: () => void;
  sourcesCount?: number;
  showSources?: boolean;
  onToggleSources?: () => void;
  className?: string;
}

export default function MessageActions({
  content,
  isFavorite,
  onToggleFavorite,
  onRegenerate,
  sourcesCount,
  showSources,
  onToggleSources,
  className,
}: MessageActionsProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [disliked, setDisliked] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("flex items-center gap-1 text-gray-400", className)}>
      <button
        type="button"
        title={t.chat.goodResponse}
        onClick={onToggleFavorite}
        className={cn(
          "rounded-md p-1.5 transition-colors hover:bg-secondary-50 hover:text-secondary-600",
          isFavorite && "text-secondary-600",
        )}
      >
        <ThumbsUp className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>
      <button
        type="button"
        title={t.chat.badResponse}
        onClick={() => setDisliked((d) => !d)}
        className={cn(
          "rounded-md p-1.5 transition-colors hover:bg-danger-50 hover:text-danger-600",
          disliked && "text-danger-600",
        )}
      >
        <ThumbsDown className={cn("h-4 w-4", disliked && "fill-current")} />
      </button>
      <button
        type="button"
        title={copied ? t.chat.copied : t.chat.copy}
        onClick={handleCopy}
        className="rounded-md p-1.5 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        {copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
      </button>
      {onRegenerate && (
        <button
          type="button"
          title={t.chat.regenerate}
          onClick={onRegenerate}
          className="rounded-md p-1.5 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      {!!sourcesCount && onToggleSources && (
        <button
          type="button"
          onClick={onToggleSources}
          className={cn(
            "ml-auto flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100 hover:text-gray-700",
            showSources && "bg-gray-100 text-gray-700",
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {showSources ? t.chat.hideSources : t.chat.viewSources}
          <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600">{sourcesCount}</span>
        </button>
      )}
    </div>
  );
}
