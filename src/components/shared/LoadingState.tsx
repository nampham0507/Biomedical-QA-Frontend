import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingState({ label, fullScreen, className }: LoadingStateProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-gray-400",
        fullScreen && "h-screen",
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
      <p className="text-sm">{label ?? t.common.loading}</p>
    </div>
  );
}
