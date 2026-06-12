import { useMemo, type MouseEvent } from "react";
import { isToday, isYesterday } from "date-fns";
import { MessagesSquare, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import { cn, truncate } from "@/lib/utils";
import { useI18n } from "@/i18n";
import type { Conversation } from "@/types";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  isLoading?: boolean;
  onSelect: (conversation: Conversation) => void;
  onNew: () => void;
  onDelete: (id: string, e: MouseEvent) => void;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
}: ConversationSidebarProps) {
  const { t } = useI18n();

  const groups = useMemo(() => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const earlier: Conversation[] = [];
    for (const c of conversations) {
      const date = new Date(c.createdAt);
      if (isToday(date)) today.push(c);
      else if (isYesterday(date)) yesterday.push(c);
      else earlier.push(c);
    }
    return [
      { label: t.chat.today, items: today },
      { label: t.chat.yesterday, items: yesterday },
      { label: t.chat.earlier, items: earlier },
    ].filter((group) => group.items.length > 0);
  }, [conversations, t]);

  return (
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-gray-50/60 md:flex">
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-ambient transition-colors hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          {t.layout.newChat}
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="mb-1.5 h-9 w-full rounded-lg" />)}

        {!isLoading && conversations.length === 0 && (
          <EmptyState icon={MessagesSquare} title={t.conversation.empty} className="py-10" />
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</p>
            {group.items.map((c) => (
              <button
                key={c._id}
                onClick={() => onSelect(c)}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  activeId === c._id ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <span className="truncate">{truncate(c.question, 38)}</span>
                <Trash2
                  onClick={(e) => onDelete(c._id, e)}
                  className="h-3.5 w-3.5 shrink-0 text-gray-300 opacity-0 transition-opacity hover:text-danger-600 group-hover:opacity-100"
                />
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
