import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ page, pages, total, limit, onPageChange, className }: PaginationProps) {
  const { t } = useI18n();
  if (pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  );

  return (
    <div className={cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}>
      <p className="text-sm text-gray-500">
        {t.common.showing} <span className="font-medium text-gray-900">{start}</span>–
        <span className="font-medium text-gray-900">{end}</span> {t.common.of}{" "}
        <span className="font-medium text-gray-900">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((p, i) => (
          <div key={p} className="flex items-center">
            {i > 0 && pageNumbers[i - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}
            <Button
              variant={p === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          </div>
        ))}
        <Button variant="outline" size="icon" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
