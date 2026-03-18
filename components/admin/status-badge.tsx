import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "danger" | "neutral" | "info" | "premium";

const VARIANTS: Record<Variant, string> = {
  success: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  danger: "bg-red-500/10 text-red-400 ring-red-500/20",
  neutral: "bg-gray-500/10 text-gray-400 ring-gray-500/20",
  info: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  premium: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
};

const DOT: Record<Variant, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  neutral: "bg-gray-400",
  info: "bg-blue-400",
  premium: "bg-amber-300",
};

interface StatusBadgeProps {
  label: string;
  variant: Variant;
  dot?: boolean;
}

export function StatusBadge({ label, variant, dot = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        VARIANTS[variant]
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT[variant])} />
      )}
      {label}
    </span>
  );
}
