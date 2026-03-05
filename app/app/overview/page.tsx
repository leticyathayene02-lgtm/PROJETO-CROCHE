import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calculator, TrendingUp, Package, Archive } from "lucide-react";
import { getCurrentMonthKey } from "@/lib/limits";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function OverviewPage() {
  const { workspace, subscription } = await requireWorkspace();
  const workspaceId = workspace.id;

  const plan =
    subscription?.plan === "PREMIUM" &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING")
      ? "PREMIUM"
      : "FREE";

  const monthKey = getCurrentMonthKey();

  // Fetch summary data in parallel
  const [
    monthTransactions,
    totalProducts,
    ,
    recentCalculations,
    usage,
    goal,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        workspaceId,
        date: {
          gte: new Date(`${monthKey.slice(0, 4)}-${monthKey.slice(4)}-01`),
        },
      },
      select: { type: true, amount: true },
    }),
    prisma.product.count({ where: { workspaceId, status: "ACTIVE" } }),
    Promise.resolve(0), // low stock count computed below from full yarn list
    prisma.priceCalculation.findMany({
      where: { workspaceId },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, totalsJson: true, createdAt: true },
    }),
    prisma.usageCounter.findUnique({
      where: { workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM: monthKey } },
    }),
    prisma.monthlyGoal.findUnique({
      where: { workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM: monthKey } },
    }),
  ]);

  // Low stock yarns (manual since Prisma can't compare two columns directly)
  const yarns = await prisma.yarn.findMany({ where: { workspaceId } });
  const lowStock = yarns.filter((y) => y.gramsAvailable < y.lowStockThreshold);

  const totalIn = monthTransactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = monthTransactions
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIn - totalOut;

  const monthName = new Date(
    `${monthKey.slice(0, 4)}-${monthKey.slice(4)}-01`
  ).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {workspace.name.split(" ").slice(-2).join(" ")} 🧶
          </h1>
          <p className="text-sm text-gray-500 capitalize">{monthName}</p>
        </div>
        {plan === "FREE" && (
          <Link href="/app/settings/billing">
            <Badge
              variant="outline"
              className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Upgrade para Premium ✨
            </Badge>
          </Link>
        )}
      </div>

      {/* Finance Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card className="border-green-100">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-gray-500">
              Entradas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totalIn)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-gray-500">
              Saídas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-xl font-bold text-red-500">
              {formatCurrency(totalOut)}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 border-rose-100 md:col-span-1">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium text-gray-500">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <p
              className={`text-xl font-bold ${profit >= 0 ? "text-rose-600" : "text-red-600"}`}
            >
              {formatCurrency(profit)}
            </p>
            {goal && goal.profitGoal > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Meta: {formatCurrency(goal.profitGoal)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/app/pricing/new">
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-4 hover:bg-rose-50 hover:border-rose-200"
            >
              <Calculator className="h-5 w-5 text-rose-500" />
              <span className="text-xs">Calcular preço</span>
            </Button>
          </Link>
          <Link href="/app/finance/new">
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-4 hover:bg-green-50 hover:border-green-200"
            >
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-xs">Nova transação</span>
            </Button>
          </Link>
          <Link href="/app/products/new">
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-4 hover:bg-purple-50 hover:border-purple-200"
            >
              <Package className="h-5 w-5 text-purple-500" />
              <span className="text-xs">Novo produto</span>
            </Button>
          </Link>
          <Link href="/app/inventory/new">
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-4 hover:bg-amber-50 hover:border-amber-200"
            >
              <Archive className="h-5 w-5 text-amber-500" />
              <span className="text-xs">Registrar fio</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {lowStock.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                {lowStock.length} fio(s) com estoque baixo:{" "}
                {lowStock.map((y) => `${y.brand} ${y.color}`).join(", ")}
              </p>
              <Link href="/app/inventory" className="ml-auto">
                <Badge
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Ver estoque
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
            <p className="text-xs text-gray-500">Produtos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {usage?.pricingCalculationsCount ?? 0}
            </p>
            <p className="text-xs text-gray-500">
              Cálculos
              {plan === "FREE" && (
                <span className="block text-[10px] text-gray-400">/10 mês</span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {yarns.length}
            </p>
            <p className="text-xs text-gray-500">Fios</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations */}
      {recentCalculations.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Últimos cálculos
            </h2>
            <Link
              href="/app/pricing"
              className="text-xs text-rose-600 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {recentCalculations.map((calc) => {
              const totals = calc.totalsJson as {
                suggestedPrice: number;
              };
              return (
                <Card key={calc.id} className="border-gray-100">
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {calc.name ?? "Sem nome"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(calc.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <p className="font-semibold text-rose-600">
                      {formatCurrency(totals?.suggestedPrice ?? 0)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
