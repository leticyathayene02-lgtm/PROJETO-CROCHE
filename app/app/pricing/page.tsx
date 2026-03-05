import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Plus, ChevronRight } from "lucide-react";

export default async function PricingPage() {
  const { workspace } = await requireWorkspace();

  const calculations = await prisma.priceCalculation.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-rose-900">
            Calculadora de Preços
          </h1>
          <p className="mt-1 text-sm text-rose-500">
            Histórico dos seus cálculos de precificação
          </p>
        </div>
        <Button
          asChild
          className="w-full bg-rose-600 hover:bg-rose-700 sm:w-auto"
        >
          <Link href="/app/pricing/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova calculadora
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {calculations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
            <Calculator className="h-7 w-7 text-rose-500" />
          </div>
          <h2 className="text-lg font-semibold text-rose-900">
            Nenhum cálculo ainda
          </h2>
          <p className="mt-1 max-w-sm text-sm text-rose-400">
            Use a calculadora para definir o preço ideal das suas peças de crochê
            com base em materiais, mão de obra e margem de lucro.
          </p>
          <Button
            asChild
            className="mt-6 bg-rose-600 hover:bg-rose-700"
          >
            <Link href="/app/pricing/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova calculadora
            </Link>
          </Button>
        </div>
      )}

      {/* Calculations list */}
      {calculations.length > 0 && (
        <div className="grid gap-3">
          {calculations.map((calc) => {
            const totals = calc.totalsJson as Record<string, number>;
            const suggestedPrice = totals?.suggestedPrice ?? 0;

            const formattedPrice = new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(suggestedPrice);

            const formattedDate = new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(calc.createdAt));

            return (
              <Link key={calc.id} href={`/app/pricing/${calc.id}`}>
                <Card className="cursor-pointer border-rose-100 transition-shadow hover:shadow-md hover:shadow-rose-100">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                        <Calculator className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-rose-900">
                          {calc.name ?? "Sem nome"}
                        </p>
                        <p className="text-xs text-rose-400">{formattedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-rose-700">
                        {formattedPrice}
                      </span>
                      <ChevronRight className="h-4 w-4 text-rose-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      {calculations.length > 0 && (
        <p className="text-center text-xs text-rose-300">
          Exibindo os últimos {calculations.length} cálculo
          {calculations.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
