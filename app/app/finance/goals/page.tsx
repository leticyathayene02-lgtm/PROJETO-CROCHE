import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Target, TrendingUp, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function getMonthKey(date: Date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function progressColor(pct: number) {
  if (pct >= 100) return "bg-emerald-400";
  if (pct >= 60) return "bg-rose-400";
  return "bg-rose-300";
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default async function GoalsPage() {
  const { workspace } = await requireWorkspace();

  const now = new Date();
  const monthKey = getMonthKey(now);
  const { start: monthStart, end: monthEnd } = getMonthRange(now);
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Current goal
  const currentGoal = await prisma.monthlyGoal.findUnique({
    where: { workspaceId_monthYYYYMM: { workspaceId: workspace.id, monthYYYYMM: monthKey } },
  });

  // Current month actuals
  const transactions = await prisma.transaction.findMany({
    where: {
      workspaceId: workspace.id,
      date: { gte: monthStart, lte: monthEnd },
    },
    select: { type: true, amount: true },
  });

  const totalEntradas = transactions
    .filter((t) => t.type === "IN")
    .reduce((s, t) => s + t.amount, 0);
  const totalSaidas = transactions
    .filter((t) => t.type === "OUT")
    .reduce((s, t) => s + t.amount, 0);
  const lucroLiquido = totalEntradas - totalSaidas;

  const revenuePct =
    currentGoal?.revenueGoal && currentGoal.revenueGoal > 0
      ? Math.min(100, Math.round((totalEntradas / currentGoal.revenueGoal) * 100))
      : null;
  const profitPct =
    currentGoal?.profitGoal && currentGoal.profitGoal > 0
      ? Math.min(100, Math.round((lucroLiquido / currentGoal.profitGoal) * 100))
      : null;

  // ─── Server Action ───────────────────────
  async function upsertGoal(formData: FormData) {
    "use server";

    const { workspace: ws } = await requireWorkspace();

    const revenueGoal = parseFloat(formData.get("revenueGoal") as string) || 0;
    const profitGoal = parseFloat(formData.get("profitGoal") as string) || 0;
    const targetMonthKey = getMonthKey(new Date());

    await prisma.monthlyGoal.upsert({
      where: {
        workspaceId_monthYYYYMM: { workspaceId: ws.id, monthYYYYMM: targetMonthKey },
      },
      create: {
        workspaceId: ws.id,
        monthYYYYMM: targetMonthKey,
        revenueGoal,
        profitGoal,
      },
      update: {
        revenueGoal,
        profitGoal,
      },
    });

    revalidatePath("/app/finance/goals");
    revalidatePath("/app/finance");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">
          <Link href="/app/finance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Metas mensais</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{monthLabel}</p>
        </div>
      </div>

      {/* Current Progress */}
      {currentGoal ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Revenue goal card */}
          <Card className="card-3d border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Meta de Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{brl(totalEntradas)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">de {brl(currentGoal.revenueGoal)}</span>
              </div>
              <div className="space-y-1">
                <div className="w-full bg-rose-100 dark:bg-rose-900/40 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${progressColor(revenuePct ?? 0)}`}
                    style={{ width: `${revenuePct ?? 0}%` }}
                  />
                </div>
                <div className="flex justify-end">
                  <Badge
                    className={
                      (revenuePct ?? 0) >= 100
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs"
                        : "bg-rose-100 dark:bg-rose-900/40 text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs"
                    }
                  >
                    {revenuePct ?? 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit goal card */}
          <Card className="card-3d border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Meta de Lucro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-end justify-between">
                <span
                  className={`text-xl font-bold ${lucroLiquido >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {brl(lucroLiquido)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">de {brl(currentGoal.profitGoal)}</span>
              </div>
              <div className="space-y-1">
                <div className="w-full bg-rose-100 dark:bg-rose-900/40 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${progressColor(profitPct ?? 0)}`}
                    style={{ width: `${Math.max(0, profitPct ?? 0)}%` }}
                  />
                </div>
                <div className="flex justify-end">
                  <Badge
                    className={
                      (profitPct ?? 0) >= 100
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs"
                        : "bg-rose-100 dark:bg-rose-900/40 text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs"
                    }
                  >
                    {Math.max(0, profitPct ?? 0)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed border-rose-200 dark:border-rose-800/40 bg-rose-50/30 dark:bg-rose-950/20">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Nenhuma meta definida para este mês</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Defina suas metas abaixo para acompanhar seu progresso</p>
          </CardContent>
        </Card>
      )}

      {/* Goal Form */}
      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle className="text-base text-gray-900 dark:text-white">
            {currentGoal ? "Atualizar metas" : "Definir metas"} — {monthLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertGoal} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="revenueGoal" className="text-gray-900 dark:text-white">
                Meta de faturamento (R$)
              </Label>
              <Input
                id="revenueGoal"
                name="revenueGoal"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 3000,00"
                defaultValue={currentGoal?.revenueGoal ?? ""}
                className="border-rose-200 dark:border-white/10 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-500/20"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Valor total de entradas que deseja alcançar este mês
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profitGoal" className="text-gray-900 dark:text-white">
                Meta de lucro líquido (R$)
              </Label>
              <Input
                id="profitGoal"
                name="profitGoal"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 2000,00"
                defaultValue={currentGoal?.profitGoal ?? ""}
                className="border-rose-200 dark:border-white/10 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-500/20"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lucro desejado após descontar todas as saídas
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-rose-200 dark:border-rose-800/40 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                asChild
              >
                <Link href="/app/finance">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                {currentGoal ? "Atualizar metas" : "Salvar metas"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        As metas são definidas por mês e workspace. Você pode atualizá-las a qualquer momento.
      </p>
    </div>
  );
}
