import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, FlaskConical, GitCompare, Pill } from "lucide-react";
import { useI18n } from "@/i18n";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ConversationSidebar from "@/components/chat/ConversationSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import PromptInput from "@/components/chat/PromptInput";
import SuggestionGrid, { type Suggestion } from "@/components/chat/SuggestionGrid";
import { useAsk } from "@/hooks/useAsk";
import { useConversation, useConversations, useDeleteConversation } from "@/hooks/useConversations";
import { useAddFavorite, useFavoriteStatus, useRemoveFavorite } from "@/hooks/useFavorites";
import type { Conversation, Source } from "@/types";

interface Exchange {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  isFavorite: boolean;
  favoriteId?: string;
  showSources: boolean;
}

function toExchange(c: Conversation): Exchange {
  return {
    id: c._id,
    question: c.question,
    answer: c.answer,
    sources: c.sources,
    isFavorite: false,
    showSources: false,
  };
}

export default function AskPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [activeId, setActiveId] = useState<string>();
  const [loadId, setLoadId] = useState<string>();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const askMutation = useAsk();
  const conversationsQuery = useConversations({ limit: 30 });
  const conversationQuery = useConversation(loadId);
  const deleteMutation = useDeleteConversation();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const favoriteStatus = useFavoriteStatus(exchanges.length === 1 ? activeId : undefined);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [exchanges, askMutation.isPending]);

  useEffect(() => {
    if (!conversationQuery.data) return;
    const c = conversationQuery.data;
    setExchanges([toExchange(c)]);
    setActiveId(c._id);
    setSessionId(c.sessionId ?? crypto.randomUUID());
    setLoadId(undefined);
  }, [conversationQuery.data]);

  useEffect(() => {
    if (!favoriteStatus.data || exchanges.length !== 1) return;
    const { isFavorite, favoriteId } = favoriteStatus.data;
    setExchanges((prev) =>
      prev.map((e) => (e.id === activeId ? { ...e, isFavorite, favoriteId } : e)),
    );
  }, [favoriteStatus.data, activeId, exchanges.length]);

  useEffect(() => {
    const state = location.state as { loadConversationId?: string; initialQuestion?: string } | null;
    if (!state) return;
    if (state.loadConversationId) {
      setLoadId(state.loadConversationId);
    } else if (state.initialQuestion) {
      handleAsk(state.initialQuestion);
    }
    navigate(location.pathname, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAsk(question: string) {
    const trimmed = question.trim();
    if (!trimmed || askMutation.isPending) return;
    setInput("");
    try {
      const result = await askMutation.mutateAsync({ question: trimmed, sessionId });
      setExchanges((prev) => [
        ...prev,
        {
          id: result.conversationId,
          question: result.question,
          answer: result.answer,
          sources: result.sources,
          isFavorite: false,
          showSources: false,
        },
      ]);
      setActiveId(result.conversationId);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  async function handleRegenerate(exchangeId: string) {
    const exchange = exchanges.find((e) => e.id === exchangeId);
    if (!exchange || askMutation.isPending) return;
    try {
      const result = await askMutation.mutateAsync({ question: exchange.question, sessionId });
      setExchanges((prev) =>
        prev.map((e) =>
          e.id === exchangeId
            ? {
                id: result.conversationId,
                question: result.question,
                answer: result.answer,
                sources: result.sources,
                isFavorite: false,
                favoriteId: undefined,
                showSources: e.showSources,
              }
            : e,
        ),
      );
      setActiveId(result.conversationId);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  async function handleToggleFavorite(exchangeId: string) {
    const exchange = exchanges.find((e) => e.id === exchangeId);
    if (!exchange) return;
    try {
      if (exchange.isFavorite && exchange.favoriteId) {
        await removeFavorite.mutateAsync(exchange.favoriteId);
        setExchanges((prev) =>
          prev.map((e) => (e.id === exchangeId ? { ...e, isFavorite: false, favoriteId: undefined } : e)),
        );
        toast({ description: t.chat.removedFromFavorites });
      } else {
        const favorite = await addFavorite.mutateAsync({ conversationId: exchangeId });
        setExchanges((prev) =>
          prev.map((e) => (e.id === exchangeId ? { ...e, isFavorite: true, favoriteId: favorite._id } : e)),
        );
        toast({ description: t.chat.addedToFavorites });
      }
    } catch {
      toast({ title: t.common.error, variant: "destructive" });
    }
  }

  function handleToggleSources(exchangeId: string) {
    setExchanges((prev) =>
      prev.map((e) => (e.id === exchangeId ? { ...e, showSources: !e.showSources } : e)),
    );
  }

  function handleNewConversation() {
    setExchanges([]);
    setActiveId(undefined);
    setLoadId(undefined);
    setSessionId(crypto.randomUUID());
    setInput("");
  }

  function handleSelectConversation(conversation: Conversation) {
    if (conversation._id === activeId) return;
    setLoadId(conversation._id);
  }

  function handleDeleteRequest(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteId(id);
  }

  function handleConfirmDelete() {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    if (deleteId === activeId) handleNewConversation();
    setDeleteId(null);
  }

  const suggestions: Suggestion[] = [
    {
      icon: FlaskConical,
      title: t.chat.suggestions.mechanismTitle,
      description: t.chat.suggestions.mechanismDesc,
    },
    {
      icon: FileText,
      title: t.chat.suggestions.researchTitle,
      description: t.chat.suggestions.researchDesc,
    },
    {
      icon: GitCompare,
      title: t.chat.suggestions.compareTitle,
      description: t.chat.suggestions.compareDesc,
    },
    {
      icon: Pill,
      title: t.chat.suggestions.interactionsTitle,
      description: t.chat.suggestions.interactionsDesc,
    },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      <ConversationSidebar
        conversations={conversationsQuery.data?.conversations ?? []}
        activeId={activeId}
        isLoading={conversationsQuery.isLoading}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteRequest}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {exchanges.length === 0 && !conversationQuery.isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-elevated">
                <FlaskConical className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">{t.chat.welcomeTitle}</h1>
              <p className="mt-1 text-sm text-gray-500">{t.chat.welcomeDescription}</p>
            </div>
            <SuggestionGrid suggestions={suggestions} onSelect={handleAsk} />
            <PromptInput value={input} onChange={setInput} onSubmit={() => handleAsk(input)} isLoading={askMutation.isPending} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 md:p-6">
                {conversationQuery.isLoading ? (
                  <div className="flex h-full items-center justify-center py-16">
                    <FlaskConical className="h-6 w-6 animate-pulse text-primary-400" />
                  </div>
                ) : (
                  exchanges.map((exchange) => (
                    <div key={exchange.id} className="flex flex-col gap-6">
                      <ChatMessage role="user" content={exchange.question} />
                      <ChatMessage
                        role="assistant"
                        content={exchange.answer}
                        sources={exchange.sources}
                        isFavorite={exchange.isFavorite}
                        onToggleFavorite={() => handleToggleFavorite(exchange.id)}
                        onRegenerate={() => handleRegenerate(exchange.id)}
                        showSources={exchange.showSources}
                        onToggleSources={() => handleToggleSources(exchange.id)}
                      />
                    </div>
                  ))
                )}

                {askMutation.isPending && (
                  <ChatMessage role="assistant" content={t.qa.asking} />
                )}

                <div ref={bottomRef} />
              </div>
            </div>
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <PromptInput value={input} onChange={setInput} onSubmit={() => handleAsk(input)} isLoading={askMutation.isPending} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.conversation.deleteConfirm}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
