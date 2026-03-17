import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { OrderForm } from "@/components/orders/OrderForm";
import { createOrder } from "@/lib/orders/actions";
import { ChevronLeft } from "lucide-react";

export default async function NewOrderPage() {
  const { workspace } = await requireWorkspace();

  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/app/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar aos pedidos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova encomenda</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registre os detalhes do pedido e acompanhe o pagamento.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] p-6 shadow-sm dark:shadow-black/10">
        <OrderForm action={createOrder} customers={customers} submitLabel="Criar encomenda" />
      </div>
    </div>
  );
}
