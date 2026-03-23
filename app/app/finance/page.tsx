import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinanceChart } from "./finance-chart";
import { TransactionActions } from "./transaction-actions";
import { TrendingUp, TrendingDown, DollarSign, Plus, Target, ChevronLeft, ChevronRight, Search } from "lucide-react";

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

function parsedMonthDate(monthParam: string | undefined): Date {
  if (monthParam && /^\d{6}$/.test(monthParam)) {
    const y = parseInt(monthParam.slice(0, 4));
    const m = parseInt(monthParam.slice(4, 6)) - 1;
    if (!isNaN(y) && m >= 0 && m <= 11) return new Date(y, m, 1);
  }
  return new Date();
}

function monthParamFromDate(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; q?: string; cat?: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { month: monthParam, q, cat } = await searchParams;

  const now = new Date();
  const selectedDate = parsedMonthDate(monthParam);
  const { start: monthStart, end: monthEnd } = getMonthRange(selectedDate);
  const monthKey = getMonthKey(selectedDate);

  // Prev / next month links
  const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
  const isCurrentMonth = getMonthKey(selectedDate) === getMonthKey(now);
  const prevParam = monthParamFromDate(prevMonth);
  const nextParam = monthParamFromDate(nextMonth);

  // Selected month transactions
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

  // Extract unique categories for filter pills
  const uniqueCategories = [...new Set(transactions.map((t) => t.category || "Sem categoria"))].sort();

  // Filter transactions for the list only (summary/DRE/chart use full data)
  const searchLower = q?.toLowerCase();
  const filteredTransactions = transactions.filter((t) => {
    if (cat && (t.category || "Sem categoria") !== cat) return false;
    if (searchLower) {
      const inCategory = (t.category || "").toLowerCase().includes(searchLower);
      const inNotes = (t.notes || "").toLowerCase().includes(searchLower);
      if (!inCategory && !inNotes) return false;
    }
    return true;
  });

  // Helper to build filter URL preserving month param
  const filterUrl = (params: { q?: string; cat?: string }) => {
    const parts = [`/app/finance?month=${monthParamFromDate(selectedDate)}`];
    if (params.q) parts.push(`q=${encodeURIComponent(params.q)}`);
    if (params.cat) parts.push(`cat=${encodeURIComponent(params.cat)}`);
    return parts.join("&");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Financeiro</h1>
          <div className="flex items-center gap-1 mt-0.5">
            <Link href={`/app/finance?month=${prevParam}`} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize min-w-[120px] text-center">
              {selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            {!isCurrentMonth ? (
              <Link href={`/app/finance?month=${nextParam}`} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="w-7" />
            )}
            {!isCurrentMonth && (
              <Link href="/app/finance" className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 ml-0.5">
                hoje
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm" className="border-rose-200 dark:border-rose-800/40 text-gray-900 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30">
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
        <Card className="card-3d border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{brl(totalEntradas)}</p>
            {monthlyGoal?.revenueGoal ? (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Meta: {brl(monthlyGoal.revenueGoal)}</span>
                  <span>{goalProgress}%</span>
                </div>
                <div className="w-full bg-rose-100 dark:bg-rose-900/40 rounded-full h-1.5">
                  <div
                    className="bg-rose-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sem meta definida</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-3d border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-gray-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Total Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-700 dark:text-gray-300">{brl(totalSaidas)}</p>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
              {transactions.filter((t) => t.type === "OUT").length} transações
            </p>
          </CardContent>
        </Card>

        <Card className={lucroLiquido >= 0 ? "border-emerald-100 dark:border-emerald-900/30" : "border-red-100 dark:border-red-900/30"}>
          <CardHeader className="pb-2">
            <CardTitle
              className={`text-sm font-medium flex items-center gap-2 ${lucroLiquido >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
            >
              <DollarSign className="h-4 w-4" />
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${lucroLiquido >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
            >
              {brl(lucroLiquido)}
            </p>
            {monthlyGoal?.profitGoal ? (
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                Meta: {brl(monthlyGoal.profitGoal)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* DRE Simples */}
      {transactions.length > 0 && (
        <Card className="card-3d border-0">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              DRE Simplificado — {selectedDate.toLocaleDateString("pt-BR", { month: "long" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DreSection transactions={transactions} />
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Resumo dos últimos 6 meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceChart data={sixMonthsData} />
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="card-3d border-0">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Transações do mês
            </CardTitle>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredTransactions.length === transactions.length
                ? `${transactions.length} registros`
                : `${filteredTransactions.length} de ${transactions.length} registros`}
            </span>
          </div>

          {/* Search + Category Filters */}
          {transactions.length > 0 && (
            <div className="space-y-3">
              <form method="get" action="/app/finance">
                <input type="hidden" name="month" value={monthParamFromDate(selectedDate)} />
                {cat && <input type="hidden" name="cat" value={cat} />}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300 dark:text-gray-500" />
                  <input
                    name="q" type="search" defaultValue={q}
                    placeholder="Buscar por categoria ou notas..."
                    className="w-full rounded-xl border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 pl-9 pr-3 py-2 text-sm text-gray-800 dark:text-white outline-none transition placeholder-rose-300 dark:placeholder-gray-500 focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20"
                  />
                </div>
              </form>

              {uniqueCategories.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={filterUrl({ q: q || undefined })}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      !cat
                        ? "bg-rose-600 text-white"
                        : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    }`}
                  >
                    Todas
                  </Link>
                  {uniqueCategories.map((category) => (
                    <Link
                      key={category}
                      href={filterUrl({ q: q || undefined, cat: category })}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        cat === category
                          ? "bg-rose-600 text-white"
                          : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      }`}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhuma transação neste mês.</p>
              <Button asChild variant="link" className="mt-2 text-gray-500 dark:text-gray-400">
                <Link href="/app/finance/new">Adicionar transação</Link>
              </Button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhuma transação encontrada com esses filtros.</p>
              <Button asChild variant="link" className="mt-2 text-rose-500 dark:text-rose-400">
                <Link href={`/app/finance?month=${monthParamFromDate(selectedDate)}`}>Limpar filtros</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-rose-50 dark:divide-white/8">
              {filteredTransactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge
                      className={
                        tx.type === "IN"
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shrink-0"
                          : "bg-rose-100 dark:bg-rose-900/40 text-gray-700 dark:text-gray-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 shrink-0"
                      }
                    >
                      {tx.type === "IN" ? "Entrada" : "Saída"}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300 truncate">{tx.category}</p>
                      {tx.notes && <p className="text-xs text-slate-400 dark:text-gray-500 truncate">{tx.notes}</p>}
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        {new Date(tx.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-sm font-semibold ${tx.type === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {tx.type === "IN" ? "+" : "-"}
                      {brl(tx.amount)}
                    </span>
                    <TransactionActions id={tx.id} />
                  </div>
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
          <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">{brl(amount)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-emerald-100 dark:border-emerald-900/30 pt-1 font-semibold">
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
          <span className="font-medium text-red-500 dark:text-red-400 tabular-nums">-{brl(amount)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-red-100 dark:border-red-900/30 pt-1 font-semibold">
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
