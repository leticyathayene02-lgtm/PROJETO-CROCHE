import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calculator,
  ChevronLeft,
  ShoppingBag,
  Banknote,
  CreditCard,
  Clock,
  Package,
  Wrench,
  Pencil,
} from "lucide-react";
import { DeleteCalcButton } from "./delete-calc-button";
import type { PricingTotals } from "@/lib/pricing";
import type { SelectedMaterialItem } from "@/lib/pricing";

interface PricingInputsJson {
  name?: string;
  material?: number;
  complementares?: number;
  selectedMaterials?: SelectedMaterialItem[];
  horas?: number;
  valorHora?: number;
  taxaCartao?: number;
  impostoMarketplace?: number;
  profitMode?: string;
  margemPercent?: number;
  lucroFixo?: number;
  frete?: number;
  embalagem?: number;
  mimo?: number;
  acessorios?: number;
  grafica?: number;
  etiqueta?: number;
  overheadPerPiece?: number;
  piecesPerMonth?: number;
}

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export default async function PricingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await requireWorkspace();

  const calc = await prisma.priceCalculation.findUnique({
    where: { id },
  });

  if (!calc || calc.workspaceId !== workspace.id) {
    notFound();
  }

  const totals = calc.totalsJson as unknown as PricingTotals;
  const inputs = calc.inputsJson as unknown as PricingInputsJson;

  const precoPix = totals?.precoPix ?? totals?.suggestedPrice ?? 0;
  const precoCartao = totals?.precoCartao ?? 0;
  const custoBase = totals?.custoBase ?? totals?.baseCost ?? 0;
  const materialTotal = totals?.materialTotal ?? 0;
  const maoObra = totals?.maoObra ?? 0;
  const overheadPerPiece = totals?.overheadPerPiece ?? 0;
  const lucroLiquidoPix = totals?.lucroLiquidoPix ?? 0;
  const lucroPercentPix = totals?.lucroPercentPix ?? 0;

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(calc.createdAt));

  const selectedMaterials = inputs.selectedMaterials ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/app/pricing"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao histórico
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {calc.name ?? "Cálculo sem nome"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </p>
          </div>
          <DeleteCalcButton id={calc.id} />
        </div>
      </div>

      {/* Prices highlight */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-emerald-600 dark:text-emerald-400">
                Preço PIX
              </p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {fmt(precoPix)}
              </p>
            </div>
          </CardContent>
        </Card>

        {precoCartao > 0 && precoCartao !== precoPix && (
          <Card className="border-blue-200 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-blue-600 dark:text-blue-400">
                  Preço Cartão
                </p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {fmt(precoCartao)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cost breakdown */}
      <Card className="border-rose-100 dark:border-rose-800/30">
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Detalhes do cálculo
          </h2>

          <div className="space-y-2.5">
            {/* Material principal */}
            {(inputs.material ?? 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Package className="h-4 w-4" />
                  Material principal (fio/linha)
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {fmt(inputs.material ?? 0)}
                </span>
              </div>
            )}

            {/* Selected materials from catalog */}
            {selectedMaterials.length > 0 && (
              <div className="space-y-1.5">
                {selectedMaterials.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Package className="h-4 w-4" />
                      {m.name}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({m.quantity} {m.unit})
                      </span>
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {fmt(m.cost)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Material total */}
            <div className="flex items-center justify-between text-sm border-t border-gray-100 dark:border-white/5 pt-2">
              <span className="text-gray-600 dark:text-gray-400">
                Total materiais
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {fmt(materialTotal)}
              </span>
            </div>

            {/* Labor */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                Mão de obra
                {(inputs.horas ?? 0) > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({inputs.horas}h x {fmt(inputs.valorHora ?? 0)}/h)
                  </span>
                )}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {fmt(maoObra)}
              </span>
            </div>

            {/* Overhead per piece */}
            {overheadPerPiece > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Wrench className="h-4 w-4" />
                  Custos fixos / peça
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {fmt(overheadPerPiece)}
                </span>
              </div>
            )}

            {/* Base cost */}
            <div className="flex items-center justify-between text-sm border-t border-gray-100 dark:border-white/5 pt-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Custo base
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {fmt(custoBase)}
              </span>
            </div>

            {/* Profit */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Lucro (PIX)
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {fmt(lucroLiquidoPix)} ({lucroPercentPix.toFixed(1)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white h-12 text-base"
        >
          <Link href={`/app/orders/new?fromCalc=${calc.id}`}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Criar pedido com esse preço
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex-1 border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-12 text-base"
        >
          <Link href={`/app/pricing/new?edit=${calc.id}`}>
            <Pencil className="mr-2 h-5 w-5" />
            Editar cálculo
          </Link>
        </Button>
      </div>
    </div>
  );
}
