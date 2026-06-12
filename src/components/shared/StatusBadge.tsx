import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<string, { variant: BadgeProps["variant"]; dot?: string }> = {
  indexed: { variant: "success" },
  completed: { variant: "success" },
  active: { variant: "success", dot: "bg-success-500" },
  processing: { variant: "default" },
  pending: { variant: "warning" },
  inactive: { variant: "outline", dot: "bg-gray-400" },
  error: { variant: "destructive" },
  failed: { variant: "destructive" },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status.toLowerCase()] ?? { variant: "gray" as const };

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.dot && <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />}
      {label ?? status}
    </Badge>
  );
}
