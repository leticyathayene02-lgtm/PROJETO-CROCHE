import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  accent?: "indigo" | "emerald" | "amber" | "rose" | "violet" | "cyan";
}

const ACCENT = {
  indigo: { icon: "bg-indigo-500/10 text-indigo-400", border: "border-indigo-500/10" },
  emerald: { icon: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/10" },
  amber: { icon: "bg-amber-500/10 text-amber-400", border: "border-amber-500/10" },
  rose: { icon: "bg-rose-500/10 text-rose-400", border: "border-rose-500/10" },
  violet: { icon: "bg-violet-500/10 text-violet-400", border: "border-violet-500/10" },
  cyan: { icon: "bg-cyan-500/10 text-cyan-400", border: "border-cyan-500/10" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  accent = "indigo",
}: StatCardProps) {
  const colors = ACCENT[accent];

  return (
    <div
      className={cn(
        "rounded-xl border bg-[#111118] p-5 transition-all hover:border-white/10",
        "border-white/[0.06]"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", colors.icon)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
}
