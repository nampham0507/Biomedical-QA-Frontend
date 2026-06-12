import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; direction: "up" | "down" };
  iconClassName?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, iconClassName }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600", iconClassName)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-semibold tracking-tight text-gray-900">{value}</div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.direction === "up" ? "text-success-600" : "text-danger-600",
            )}
          >
            {trend.direction === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
