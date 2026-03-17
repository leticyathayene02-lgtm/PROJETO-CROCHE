import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { updateProductionStatus } from "@/lib/orders/actions";
import { PaymentStatusBadge } from "@/components/orders/PaymentStatusBadge";
import { Plus, ChevronLeft } from "lucide-react";

const COLUMNS = [
  { key: "TODO", label: "A fazer", color: "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[oklch(0.15_0.008_280)]" },
  { key: "IN_PROGRESS", label: "Em produção", color: "border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20" },
  { key: "FINISHING", label: "Acabamento", color: "border-violet-200 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20" },
  { key: "READY", label: "Pronto", color: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20" },
  { key: "DELIVERED", label: "Entregue", color: "border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20" },
] as const;

type ProductionStatus = (typeof COLUMNS)[number]["key"];

const NEXT_STATUS: Record<string, ProductionStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "FINISHING",
  FINISHING: "READY",
  READY: "DELIVERED",
  DELIVERED: "DELIVERED",
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function OrderBoardPage() {
  const { workspace } = await requireWorkspace();
  const now = new Date();

  const orders = await prisma.order.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { dueDate: "asc" },
    select: {
      id: true,
      customerName: true,
      itemDescription: true,
      amount: true,
      dueDate: true,
      paymentStatus: true,
      productionStatus: true,
    },
  });

  const byStatus = Object.fromEntries(
    COLUMNS.map((col) => [col.key, orders.filter((o) => o.productionStatus === col.key)])
  ) as Record<ProductionStatus, typeof orders>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/orders" className="text-sm text-gray-700 dark:text-gray-300 hover:underline">
            <ChevronLeft className="inline h-4 w-4" /> Lista
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quadro de Produção</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {orders.length} pedido{orders.length !== 1 ? "s" : ""} no total
            </p>
          </div>
        </div>
        <Link
          href="/app/orders/new"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          Nova encomenda
        </Link>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colOrders = byStatus[col.key];
          return (
            <div
              key={col.key}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border p-3 ${col.color}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{col.label}</h2>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/70 dark:bg-white/10 text-xs font-bold text-gray-500 dark:text-gray-400">
                  {colOrders.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {colOrders.map((order) => {
                  const isLate = order.dueDate < now && order.paymentStatus !== "PAID";
                  const nextS = NEXT_STATUS[col.key];
                  const canAdvance = col.key !== "DELIVERED";

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] p-3 shadow-sm dark:shadow-black/10"
                    >
                      <div className="mb-1 flex items-start justify-between gap-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
                          {order.customerName}
                        </p>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                      <p className="mb-2 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {order.itemDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          <span className={isLate ? "font-semibold text-red-500" : ""}>
                            {formatDate(order.dueDate)}
                          </span>
                          {isLate && <span className="ml-1 text-red-400">· atrasado</span>}
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(order.amount)}
                        </span>
                      </div>

                      <div className="mt-2 flex gap-1.5">
                        <Link
                          href={`/app/orders/${order.id}`}
                          className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[oklch(0.15_0.008_280)] py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          Ver
                        </Link>
                        {canAdvance && (
                          <form
                            action={async () => {
                              "use server";
                              await updateProductionStatus(order.id, nextS);
                            }}
                            className="flex-1"
                          >
                            <button
                              type="submit"
                              className="w-full rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-950/20 py-1 text-xs font-semibold text-gray-900 dark:text-gray-300 transition hover:bg-rose-100 dark:hover:bg-rose-950/40"
                            >
                              → Avançar
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colOrders.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-6 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Nenhum pedido</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
