import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  bar,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  bar?: number;
  trend?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        <Icon className="h-4 w-4 text-ink-400" />
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-semibold text-ink-900">{value}</div>
        {trend && (
          <span className="text-xs font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded-md">
            {trend}
          </span>
        )}
      </div>

      {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}

      {bar != null && (
        <div className="mt-3 h-2 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width]"
            style={{ width: `${Math.max(0, Math.min(100, bar))}%` }}
          />
        </div>
      )}
    </Card>
  );
}
