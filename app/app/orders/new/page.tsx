import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { OrderForm } from "@/components/orders/OrderForm";
import { createOrder } from "@/lib/orders/actions";
import { ChevronLeft, Calculator } from "lucide-react";
import type { PricingTotals } from "@/lib/pricing";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ fromCalc?: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { fromCalc } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Pre-fill from pricing calculation if fromCalc is provided
  let defaultValues: Record<string, string | number | undefined> = {};
  let calcName: string | null = null;

  if (fromCalc) {
    const calc = await prisma.priceCalculation.findFirst({
      where: { id: fromCalc, workspaceId: workspace.id },
    });

    if (calc) {
      const totals = calc.totalsJson as unknown as PricingTotals;
      const precoPix = totals?.precoPix ?? totals?.suggestedPrice ?? 0;
      calcName = calc.name ?? "Cálculo sem nome";
      defaultValues = {
        itemDescription: calcName,
        amount: precoPix,
      };
    }
  }

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

      {calcName && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50/80 dark:bg-rose-950/20 px-4 py-3">
          <Calculator className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
          <p className="text-sm text-rose-700 dark:text-rose-300">
            Preço baseado no cálculo: <span className="font-semibold">{calcName}</span>
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] p-6 shadow-sm dark:shadow-black/10">
        <OrderForm action={createOrder} customers={customers} defaultValues={defaultValues} submitLabel="Criar encomenda" />
      </div>
    </div>
  );
}
