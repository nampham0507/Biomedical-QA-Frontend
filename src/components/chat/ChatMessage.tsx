import ReactMarkdown from "react-markdown";
import { FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import type { Source } from "@/types";
import CitationCard from "@/components/shared/CitationCard";
import MessageActions from "./MessageActions";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onRegenerate?: () => void;
  showSources?: boolean;
  onToggleSources?: () => void;
}

export default function ChatMessage({
  role,
  content,
  sources,
  isFavorite,
  onToggleFavorite,
  onRegenerate,
  showSources,
  onToggleSources,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary-600 px-4 py-2.5 text-sm text-white shadow-sm">
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
        <FlaskConical className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {showSources && sources && sources.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {sources.map((source, i) => (
              <CitationCard key={i} source={source} index={i} />
            ))}
          </div>
        )}

        <MessageActions
          content={content}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onRegenerate={onRegenerate}
          sourcesCount={sources?.length}
          showSources={showSources}
          onToggleSources={onToggleSources}
          className="border-t border-gray-100 pt-2"
        />
      </div>
    </motion.div>
  );
}
