import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "./EmptyState";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  rowKey,
  emptyTitle,
  emptyDescription,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const { t } = useI18n();

  return (
    <div className={cn("overflow-hidden rounded-xl border border-gray-200 bg-white shadow-ambient", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn("whitespace-nowrap px-4 py-3 font-semibold", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[160px]" />
                    </td>
                  ))}
                </tr>
              ))}
            {!isLoading &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors hover:bg-gray-50",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-gray-700", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!isLoading && data.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={emptyTitle ?? t.common.noData}
          description={emptyDescription}
          className="border-0"
        />
      )}
    </div>
  );
}
