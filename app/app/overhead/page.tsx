import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { OverheadClient } from "./overhead-client";
import { Wrench } from "lucide-react";

export default async function OverheadPage() {
  const { workspace } = await requireWorkspace();

  const costs = await prisma.overheadCost.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, amount: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40">
          <Wrench className="h-5 w-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Custos Fixos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aluguel, luz, internet e outros gastos mensais do ateliê
          </p>
        </div>
      </div>

      <OverheadClient initialCosts={costs} />

      {/* Info */}
      <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 px-4 py-3">
        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
          <strong>Dica:</strong> Divida o total dos custos fixos pela quantidade de peças que você produz por mês para saber quanto de custo fixo incluir no preço de cada peça.
        </p>
      </div>
    </div>
  );
}
