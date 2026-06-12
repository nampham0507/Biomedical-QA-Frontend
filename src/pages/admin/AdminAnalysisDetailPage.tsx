import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BookOpen, Clock, Gauge, SearchX, Zap } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import CitationCard from "@/components/shared/CitationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useConversation } from "@/hooks/useConversations";
import { formatDate } from "@/lib/utils";

export default function AdminAnalysisDetailPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const conversationQuery = useConversation(id);

  if (conversationQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  if (conversationQuery.isError || !conversationQuery.data) {
    return (
      <PageContainer>
        <EmptyState
          icon={SearchX}
          title={t.analysis.notFound}
          description={t.analysis.notFoundDescription}
          action={
            <Button onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
              {t.analysis.back}
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const conversation = conversationQuery.data;
  const avgScore = conversation.sources.length
    ? conversation.sources.reduce((sum, s) => sum + s.score, 0) / conversation.sources.length
    : 0;

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="-ml-2 w-fit">
        <ArrowLeft className="h-4 w-4" />
        {t.analysis.back}
      </Button>

      <PageHeader title={t.analysis.title} description={formatDate(conversation.createdAt)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.analysis.confidence} value={`${(avgScore * 100).toFixed(0)}%`} icon={Gauge} />
        <StatCard label={t.analysis.sourcesAnalyzed} value={conversation.sources.length} icon={BookOpen} />
        <StatCard
          label={t.qa.processingTime}
          value={conversation.processingTime != null ? `${conversation.processingTime}${t.qa.ms}` : "—"}
          icon={Clock}
        />
        <StatCard
          label={t.qa.tokensUsed}
          value={conversation.tokensUsed != null ? conversation.tokensUsed.toLocaleString() : "—"}
          icon={Zap}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.analysis.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{conversation.question}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.qa.answer}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="markdown-content">
            <ReactMarkdown>{conversation.answer}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {conversation.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.qa.sources}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {conversation.sources.map((source, i) => (
              <CitationCard key={i} source={source} index={i} />
            ))}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
