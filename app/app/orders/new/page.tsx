import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { OrderForm } from "@/components/orders/OrderForm";
import { createOrder } from "@/lib/orders/actions";
import { ChevronLeft } from "lucide-react";

export default async function NewOrderPage() {
  await requireWorkspace();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/app/orders"
          className="mb-4 inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 dark:text-rose-400"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar aos pedidos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova encomenda</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registre os detalhes do pedido e acompanhe o pagamento.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-white/3">
        <OrderForm action={createOrder} submitLabel="Criar encomenda" />
      </div>
    </div>
  );
}
