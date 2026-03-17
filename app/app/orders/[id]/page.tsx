import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { OrderForm } from "@/components/orders/OrderForm";
import { PaymentStatusBadge } from "@/components/orders/PaymentStatusBadge";
import { ProductionStatusBadge } from "@/components/orders/ProductionStatusBadge";
import { ChecklistEditor } from "@/components/orders/ChecklistEditor";
import { ReceiptActions } from "@/components/orders/ReceiptActions";
import { TimerWidget } from "@/components/time/TimerWidget";
import { updateOrder, deleteOrder } from "@/lib/orders/actions";
import { ChevronLeft, CheckSquare } from "lucide-react";
import type { ChecklistItem } from "@/lib/orders/validators";

function toDateInput(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { id } = await params;

  const [order, customers] = await Promise.all([
    prisma.order.findFirst({
      where: { id, workspaceId: workspace.id },
    }),
    prisma.customer.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!order) notFound();

  const updateWithId = updateOrder.bind(null, order.id);
  const deleteWithId = deleteOrder.bind(null, order.id);

  const checklist: ChecklistItem[] = Array.isArray(order.checklistJson)
    ? (order.checklistJson as ChecklistItem[])
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/app/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar aos pedidos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {order.customerName}
          </h1>
          <PaymentStatusBadge status={order.paymentStatus} />
          <ProductionStatusBadge status={order.productionStatus} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{order.itemDescription}</p>
      </div>

      {/* PDF / WhatsApp */}
      <ReceiptActions order={{
        id: order.id,
        customerName: order.customerName,
        itemDescription: order.itemDescription,
        amount: order.amount,
        dueDate: order.dueDate.toISOString(),
        orderDate: order.orderDate.toISOString(),
        paymentStatus: order.paymentStatus,
        notes: order.notes ?? undefined,
      }} />

      {/* Timer */}
      <TimerWidget orderId={order.id} label="Cronômetro desta peça" />

      {/* Checklist */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[oklch(0.18_0.01_280)]">
        <div className="mb-4 flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Checklist</h2>
        </div>
        <ChecklistEditor orderId={order.id} initialItems={checklist} />
      </div>

      {/* Edit form */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[oklch(0.18_0.01_280)]">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Editar pedido</h2>
        <OrderForm
          action={updateWithId}
          customers={customers}
          submitLabel="Salvar alterações"
          defaultValues={{
            orderDate: toDateInput(order.orderDate),
            customerName: order.customerName,
            customerId: order.customerId ?? "",
            itemDescription: order.itemDescription,
            dueDate: toDateInput(order.dueDate),
            amount: order.amount,
            paymentStatus: order.paymentStatus,
            productionStatus: order.productionStatus,
            notes: order.notes ?? "",
            channel: order.channel ?? "",
          }}
        />
      </div>

      {/* Delete */}
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/10">
        <p className="mb-3 text-sm font-medium text-red-700 dark:text-red-400">
          Excluir este pedido permanentemente
        </p>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
            onClick={(e) => {
              if (!confirm("Excluir este pedido? Esta ação não pode ser desfeita.")) {
                e.preventDefault();
              }
            }}
          >
            Excluir pedido
          </button>
        </form>
      </div>
    </div>
  );
}
