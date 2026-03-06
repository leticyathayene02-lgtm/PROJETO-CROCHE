import { cn } from "@/lib/utils";

type ProductionStatus = "TODO" | "IN_PROGRESS" | "FINISHING" | "READY" | "DELIVERED";

const config: Record<ProductionStatus, { label: string; className: string }> = {
  TODO: {
    label: "A fazer",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
  },
  IN_PROGRESS: {
    label: "Em produção",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  FINISHING: {
    label: "Acabamento",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  },
  READY: {
    label: "Pronto",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  DELIVERED: {
    label: "Entregue",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  },
};

export function ProductionStatusBadge({ status }: { status: string }) {
  const s = config[status as ProductionStatus] ?? config.TODO;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        s.className
      )}
    >
      {s.label}
    </span>
  );
}
