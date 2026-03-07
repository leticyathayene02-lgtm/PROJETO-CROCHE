import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinanceChart } from "./finance-chart";
import { TrendingUp, TrendingDown, DollarSign, Plus, Target } from "lucide-react";

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

export default async function FinancePage() {
  const { workspace } = await requireWorkspace();

  const now = new Date();
  const { start: monthStart, end: monthEnd } = getMonthRange(now);
  const monthKey = getMonthKey(now);

  // Current month transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      workspaceId: workspace.id,
      date: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { date: "desc" },
  });

  // Current month goal
  const monthlyGoal = await prisma.monthlyGoal.findUnique({
    where: { workspaceId_monthYYYYMM: { workspaceId: workspace.id, monthYYYYMM: monthKey } },
  });

  // Recent 10 transactions (all time) for the list
  const recentTransactions = await prisma.transaction.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { date: "desc" },
    take: 10,
  });

  // Past 6 months summary for chart
  const sixMonthsData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { date: d, label: getMonthLabel(d) };
    }).map(async ({ date, label }) => {
      const { start, end } = getMonthRange(date);
      const txs = await prisma.transaction.findMany({
        where: {
          workspaceId: workspace.id,
          date: { gte: start, lte: end },
        },
        select: { type: true, amount: true },
      });
      const entradas = txs.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
      const saidas = txs.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
      return { month: label, entradas, saidas, lucro: entradas - saidas };
    })
  );

  // Current month summary
  const totalEntradas = transactions
    .filter((t) => t.type === "IN")
    .reduce((s, t) => s + t.amount, 0);
  const totalSaidas = transactions
    .filter((t) => t.type === "OUT")
    .reduce((s, t) => s + t.amount, 0);
  const lucroLiquido = totalEntradas - totalSaidas;

  const goalProgress =
    monthlyGoal?.revenueGoal && monthlyGoal.revenueGoal > 0
      ? Math.min(100, Math.round((totalEntradas / monthlyGoal.revenueGoal) * 100))
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-rose-900">Financeiro</h1>
          <p className="text-sm text-rose-500 mt-0.5">
            {now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-rose-200 text-rose-700 hover:bg-rose-50">
            <Link href="/app/finance/goals">
              <Target className="h-4 w-4 mr-1.5" />
              Metas
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-rose-500 hover:bg-rose-600 text-white">
            <Link href="/app/finance/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Nova transação
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-700">{brl(totalEntradas)}</p>
            {monthlyGoal?.revenueGoal ? (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-rose-400">
                  <span>Meta: {brl(monthlyGoal.revenueGoal)}</span>
                  <span>{goalProgress}%</span>
                </div>
                <div className="w-full bg-rose-100 rounded-full h-1.5">
                  <div
                    className="bg-rose-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-300 mt-1">Sem meta definida</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-700">{brl(totalSaidas)}</p>
            <p className="text-xs text-slate-400 mt-1">
              {transactions.filter((t) => t.type === "OUT").length} transações
            </p>
          </CardContent>
        </Card>

        <Card className={lucroLiquido >= 0 ? "border-emerald-100" : "border-red-100"}>
          <CardHeader className="pb-2">
            <CardTitle
              className={`text-sm font-medium flex items-center gap-2 ${lucroLiquido >= 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              <DollarSign className="h-4 w-4" />
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${lucroLiquido >= 0 ? "text-emerald-700" : "text-red-600"}`}
            >
              {brl(lucroLiquido)}
            </p>
            {monthlyGoal?.profitGoal ? (
              <p className="text-xs text-slate-400 mt-1">
                Meta: {brl(monthlyGoal.profitGoal)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* DRE Simples */}
      {transactions.length > 0 && (
        <Card className="border-rose-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-rose-900 dark:text-white">
              DRE Simplificado — {now.toLocaleDateString("pt-BR", { month: "long" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DreSection transactions={transactions} />
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card className="border-rose-100">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-rose-900">
            Resumo dos últimos 6 meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceChart data={sixMonthsData} />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-rose-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-rose-900">
              Transações recentes
            </CardTitle>
            <span className="text-xs text-rose-400">{recentTransactions.length} registros</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <p className="text-rose-300 text-sm">Nenhuma transação registrada ainda.</p>
              <Button asChild variant="link" className="mt-2 text-rose-500">
                <Link href="/app/finance/new">Adicionar primeira transação</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-rose-50">
              {recentTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-rose-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      className={
                        tx.type === "IN"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shrink-0"
                          : "bg-rose-100 text-rose-600 hover:bg-rose-100 shrink-0"
                      }
                    >
                      {tx.type === "IN" ? "Entrada" : "Saída"}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{tx.category}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold shrink-0 ml-4 ${tx.type === "IN" ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {tx.type === "IN" ? "+" : "-"}
                    {brl(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── DRE Component ──────────────────────────────────────────────────

type Tx = { type: string; amount: number; category: string };

function DreSection({ transactions }: { transactions: Tx[] }) {
  const entradas = transactions.filter((t) => t.type === "IN");
  const saidas = transactions.filter((t) => t.type === "OUT");

  // Group by category
  const groupBy = (txs: Tx[]) => {
    const map = new Map<string, number>();
    for (const t of txs) {
      const cat = t.category || "Sem categoria";
      map.set(cat, (map.get(cat) || 0) + t.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  };

  const entradasByCat = groupBy(entradas);
  const saidasByCat = groupBy(saidas);
  const totalIn = entradas.reduce((s, t) => s + t.amount, 0);
  const totalOut = saidas.reduce((s, t) => s + t.amount, 0);
  const lucro = totalIn - totalOut;

  return (
    <div className="space-y-1 text-sm">
      {/* Receitas */}
      <p className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase text-xs tracking-wider">
        Receitas
      </p>
      {entradasByCat.map(([cat, amount]) => (
        <div key={cat} className="flex justify-between py-0.5 pl-4">
          <span className="text-gray-600 dark:text-gray-400">{cat}</span>
          <span className="font-medium text-emerald-600 tabular-nums">{brl(amount)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-emerald-100 pt-1 font-semibold dark:border-emerald-900/30">
        <span className="text-gray-700 dark:text-gray-300">Total receitas</span>
        <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">{brl(totalIn)}</span>
      </div>

      <div className="h-3" />

      {/* Custos */}
      <p className="font-semibold text-red-600 dark:text-red-400 uppercase text-xs tracking-wider">
        Custos e despesas
      </p>
      {saidasByCat.map(([cat, amount]) => (
        <div key={cat} className="flex justify-between py-0.5 pl-4">
          <span className="text-gray-600 dark:text-gray-400">{cat}</span>
          <span className="font-medium text-red-500 tabular-nums">-{brl(amount)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-red-100 pt-1 font-semibold dark:border-red-900/30">
        <span className="text-gray-700 dark:text-gray-300">Total custos</span>
        <span className="text-red-600 dark:text-red-400 tabular-nums">-{brl(totalOut)}</span>
      </div>

      <div className="h-3" />

      {/* Lucro */}
      <div className={`flex justify-between rounded-xl px-4 py-3 font-bold ${
        lucro >= 0
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
      }`}>
        <span>RESULTADO LÍQUIDO</span>
        <span className="tabular-nums">{brl(lucro)}</span>
      </div>
    </div>
  );
}
