import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Plus, RotateCcw } from "lucide-react";

export default async function PricingPage() {
  const { workspace } = await requireWorkspace();

  const calculations = await prisma.priceCalculation.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Calculadora de Preços
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Histórico dos seus cálculos de precificação
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-rose-600 hover:bg-rose-700 sm:w-auto"
        >
          <Link href="/app/pricing/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo cálculo
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {calculations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 dark:border-rose-800/40 bg-rose-50/50 dark:bg-rose-950/20 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
            <Calculator className="h-7 w-7 text-rose-500 dark:text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nenhum cálculo ainda
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Use a calculadora para definir o preço ideal das suas peças
            com base em materiais, mão de obra e margem de lucro.
          </p>
          <Button
            asChild
            className="mt-6 bg-rose-600 hover:bg-rose-700"
          >
            <Link href="/app/pricing/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo cálculo
            </Link>
          </Button>
        </div>
      )}

      {/* Calculations list */}
      {calculations.length > 0 && (
        <div className="grid gap-3">
          {calculations.map((calc) => {
            const totals = calc.totalsJson as Record<string, number>;
            const inputs = calc.inputsJson as Record<string, unknown>;

            // Support both new and old format
            const precoPix = totals?.precoPix ?? totals?.suggestedPrice ?? 0;
            const precoCartao = totals?.precoCartao ?? 0;
            const custoBase = totals?.custoBase ?? totals?.baseCost ?? 0;

            const formattedPix = fmt(precoPix);
            const formattedCartao = fmt(precoCartao);
            const formattedDate = new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(calc.createdAt));

            // Build prefill URL for "Usar novamente"
            const prefillData = encodeURIComponent(JSON.stringify(inputs));

            return (
              <Card
                key={calc.id}
                className="border-rose-100 dark:border-rose-800/30 transition-shadow hover:shadow-md hover:shadow-rose-100 dark:hover:shadow-black/10"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40">
                        <Calculator className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {calc.name ?? "Sem nome"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
                        {custoBase > 0 && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Custo: {fmt(custoBase)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium uppercase text-emerald-500">PIX</span>
                        <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                          {formattedPix}
                        </span>
                      </div>
                      {precoCartao > 0 && precoCartao !== precoPix && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-medium uppercase text-blue-500">Cartão</span>
                          <span className="text-sm font-semibold text-blue-700">
                            {formattedCartao}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action: Usar novamente */}
                  <div className="mt-3 flex justify-end">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Link href={`/app/pricing/new?prefill=${prefillData}`}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Usar novamente
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      {calculations.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Exibindo os últimos {calculations.length} cálculo
          {calculations.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
