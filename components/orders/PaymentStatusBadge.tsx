import { cn } from "@/lib/utils";

type PaymentStatus = "UNPAID" | "HALF_PAID" | "PAID";

const config: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID: {
    label: "Não pago",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  HALF_PAID: {
    label: "50% pago",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  PAID: {
    label: "Pago",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const s = config[status as PaymentStatus] ?? config.UNPAID;
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
