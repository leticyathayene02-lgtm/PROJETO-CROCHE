import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { PaymentStatusBadge } from "@/components/orders/PaymentStatusBadge";
import { ProductionStatusBadge } from "@/components/orders/ProductionStatusBadge";
import { updatePaymentStatus } from "@/lib/orders/actions";
import { Package, Plus, ClipboardList, LayoutGrid } from "lucide-react";

const FILTER_TABS = [
  { key: "all", label: "Todos" },
  { key: "UNPAID", label: "Não pago" },
  { key: "HALF_PAID", label: "50% pago" },
  { key: "PAID", label: "Pago" },
  { key: "late", label: "Atrasados" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["key"];

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

function formatCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function nextStatus(current: string): "UNPAID" | "HALF_PAID" | "PAID" {
  if (current === "UNPAID") return "HALF_PAID";
  if (current === "HALF_PAID") return "PAID";
  return "PAID";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const params = await searchParams;
  const filter = (params.filter ?? "all") as FilterKey;
  const q = params.q ?? "";
  const now = new Date();

  const where: Prisma.OrderWhereInput = {
    workspaceId: workspace.id,
    ...(filter === "late"
      ? { dueDate: { lt: now }, paymentStatus: { in: ["UNPAID", "HALF_PAID"] } }
      : filter !== "all"
      ? { paymentStatus: filter as "UNPAID" | "HALF_PAID" | "PAID" }
      : {}),
    ...(q ? { customerName: { contains: q, mode: "insensitive" } } : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Encomendas e acompanhamento de pagamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/app/orders/board"
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 dark:border-rose-800/50 dark:bg-transparent dark:text-rose-400"
          >
            <LayoutGrid className="h-4 w-4" />
            Quadro
          </Link>
          <Link
            href="/app/orders/new"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Nova encomenda
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/app/orders?filter=${tab.key}${q ? `&q=${q}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === tab.key
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-rose-950/30"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form method="get" action="/app/orders" className="flex-1 sm:max-w-xs">
          <input type="hidden" name="filter" value={filter} />
          <input
            name="q" type="search" defaultValue={q}
            placeholder="Buscar cliente..."
            className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isLate = order.dueDate < now && order.paymentStatus !== "PAID";
            const canAdvance = order.paymentStatus !== "PAID";

            return (
              <div
                key={order.id}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/8 dark:bg-white/3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {order.customerName}
                    </p>
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <ProductionStatusBadge status={order.productionStatus} />
                    {isLate && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                        ATRASADO
                      </span>
                    )}
                    {order.channel && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        via {order.channel}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                    {order.itemDescription}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
                    <span>
                      Entrega:{" "}
                      <strong className={isLate ? "text-red-500" : ""}>{formatDate(order.dueDate)}</strong>
                    </span>
                    <span>Pedido: {formatDate(order.orderDate)}</span>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    {formatCurrency(order.amount)}
                  </span>

                  {canAdvance && (
                    <form
                      action={async () => {
                        "use server";
                        await updatePaymentStatus(order.id, nextStatus(order.paymentStatus));
                      }}
                    >
                      <button
                        type="submit"
                        title={`Marcar como ${nextStatus(order.paymentStatus) === "HALF_PAID" ? "50% pago" : "Pago"}`}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
                      >
                        {nextStatus(order.paymentStatus) === "HALF_PAID" ? "→ 50%" : "→ Pago"}
                      </button>
                    </form>
                  )}

                  <Link
                    href={`/app/orders/${order.id}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                  >
                    Detalhes
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ filter }: { filter: FilterKey }) {
  const isFiltered = filter !== "all";
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 px-6 py-16 text-center dark:border-rose-900/30 dark:from-rose-950/20 dark:via-gray-950 dark:to-gray-950">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200/50">
        {isFiltered ? <Package className="h-8 w-8 text-white" /> : <ClipboardList className="h-8 w-8 text-white" />}
      </div>
      <h2 className="mb-2 text-lg font-bold text-rose-900 dark:text-rose-100">
        {isFiltered ? "Nenhum pedido neste filtro" : "Nenhum pedido ainda"}
      </h2>
      <p className="mb-6 max-w-xs text-sm text-rose-600/80 dark:text-rose-300/60">
        {isFiltered
          ? "Tente outro filtro ou limpe a busca."
          : "Registre sua primeira encomenda e acompanhe os pagamentos de forma organizada."}
      </p>
      {!isFiltered && (
        <Link
          href="/app/orders/new"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          Nova encomenda
        </Link>
      )}
    </div>
  );
}
