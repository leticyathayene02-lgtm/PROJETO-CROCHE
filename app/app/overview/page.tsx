import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthKey } from "@/lib/limits";
import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Archive,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  Target,
  ClipboardList,
  Clock,
  DollarSign,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

// ─── decorative SVG ─────────────────────────────────────────────────────────

function YarnBallSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="yarnBg" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="yarnShadow" cx="60%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#9f1239" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Main sphere */}
      <circle cx="100" cy="100" r="88" fill="white" fillOpacity="0.12" />
      <circle cx="100" cy="100" r="88" fill="url(#yarnBg)" />
      <circle cx="100" cy="100" r="88" fill="url(#yarnShadow)" />
      {/* Yarn wrap lines */}
      <path d="M 32 80 Q 100 20 168 80 Q 140 160 60 175 Q 20 140 32 80Z" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" fill="none" />
      <path d="M 20 115 Q 70 55 155 65 Q 180 115 160 170 Q 90 195 20 115Z" stroke="white" strokeOpacity="0.20" strokeWidth="1.5" fill="none" />
      <path d="M 50 170 Q 110 185 165 140 Q 185 80 140 45 Q 80 30 50 60 Q 20 90 50 170Z" stroke="white" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
      <path d="M 30 100 Q 60 170 140 185 Q 185 165 185 100" stroke="white" strokeOpacity="0.15" strokeWidth="1" fill="none" />
      <path d="M 55 35 Q 140 25 170 90 Q 175 150 120 185" stroke="white" strokeOpacity="0.12" strokeWidth="1" fill="none" />
      <path d="M 100 12 Q 170 30 188 100 Q 175 170 100 188 Q 30 170 12 100 Q 25 30 100 12Z" stroke="white" strokeOpacity="0.10" strokeWidth="2" fill="none" />
      {/* Shine */}
      <ellipse cx="72" cy="64" rx="18" ry="10" fill="white" fillOpacity="0.22" transform="rotate(-30 72 64)" />
      <circle cx="82" cy="58" r="5" fill="white" fillOpacity="0.18" />
    </svg>
  );
}

// ─── sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  goal,
  trend,
  variant,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  goal?: { current: number; target: number };
  trend?: "up" | "down" | "neutral";
  variant: "green" | "red" | "rose" | "amber";
  icon: React.ReactNode;
}) {
  const palette = {
    green: {
      bg: "from-emerald-50 via-green-50 to-teal-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      bar: "bg-emerald-400",
    },
    red: {
      bg: "from-red-50 via-rose-50 to-orange-50",
      border: "border-red-100",
      text: "text-red-600",
      badge: "bg-red-100 text-red-600",
      bar: "bg-red-400",
    },
    rose: {
      bg: "from-rose-50 via-pink-50 to-fuchsia-50",
      border: "border-rose-100",
      text: "text-rose-700",
      badge: "bg-rose-100 text-rose-700",
      bar: "bg-rose-500",
    },
    amber: {
      bg: "from-amber-50 via-yellow-50 to-orange-50",
      border: "border-amber-100",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
      bar: "bg-amber-400",
    },
  };
  const p = palette[variant];
  const progress = goal ? pct(goal.current, goal.target) : null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-shadow hover:shadow-md ${p.bg} ${p.border}`}
    >
      {/* Background orb */}
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 ${p.bar}`} />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${p.badge}`}>
            {icon}
          </div>
          {trend && trend !== "neutral" && (
            <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.badge}`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend === "up" ? "Alta" : "Baixa"}
            </span>
          )}
        </div>

        <p className="mb-0.5 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          {label}
        </p>
        <p className={`font-heading text-3xl font-bold tracking-tight ${p.text}`}>
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}

        {progress !== null && goal && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-gray-400">
              <span>Meta</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${p.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              Meta: {fmt(goal.target)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({
  value,
  label,
  icon,
}: {
  value: number | string;
  label: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <p className="font-heading text-2xl font-bold tracking-tight text-gray-800">
        {value}
      </p>
      <p className="text-center text-[11px] leading-tight text-gray-400">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div
        className={`group flex items-center gap-3 rounded-2xl border border-transparent bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${color}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-current/10">
          <span className="text-inherit">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="truncate text-xs text-gray-400">{description}</p>
        </div>
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-400" />
      </div>
    </Link>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function OverviewPage() {
  const { workspace, subscription, user } = await requireWorkspace();
  const workspaceId = workspace.id;

  const plan =
    subscription?.plan === "PREMIUM" &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING")
      ? "PREMIUM"
      : "FREE";

  const monthKey = getCurrentMonthKey();

  const [monthTransactions, totalProducts, recentCalculations, usage, goal] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          workspaceId,
          date: {
            gte: new Date(
              `${monthKey.slice(0, 4)}-${monthKey.slice(4)}-01`
            ),
          },
        },
        select: { type: true, amount: true },
      }),
      prisma.product.count({ where: { workspaceId, status: "ACTIVE" } }),
      prisma.priceCalculation.findMany({
        where: { workspaceId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, totalsJson: true, createdAt: true },
      }),
      prisma.usageCounter.findUnique({
        where: {
          workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM: monthKey },
        },
      }),
      prisma.monthlyGoal.findUnique({
        where: {
          workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM: monthKey },
        },
      }),
    ]);

  const now = new Date();
  const in7days = new Date(now);
  in7days.setDate(in7days.getDate() + 7);

  const [yarns, lateOrders, dueSoonOrders, unpaidOrders] = await Promise.all([
    prisma.yarn.findMany({ where: { workspaceId } }),
    prisma.order.findMany({
      where: {
        workspaceId,
        dueDate: { lt: now },
        productionStatus: { not: "DELIVERED" },
      },
      select: { id: true, customerName: true, dueDate: true, amount: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        workspaceId,
        dueDate: { gte: now, lte: in7days },
        productionStatus: { not: "DELIVERED" },
      },
      select: { id: true, customerName: true, dueDate: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        workspaceId,
        paymentStatus: { in: ["UNPAID", "HALF_PAID"] },
      },
      select: { amount: true, paymentStatus: true },
    }),
  ]);

  const lowStock = yarns.filter((y) => y.gramsAvailable < y.lowStockThreshold);
  const totalReceivable = unpaidOrders.reduce((s, o) => {
    return s + (o.paymentStatus === "HALF_PAID" ? o.amount * 0.5 : o.amount);
  }, 0);

  const totalIn = monthTransactions
    .filter((t) => t.type === "IN")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = monthTransactions
    .filter((t) => t.type === "OUT")
    .reduce((s, t) => s + t.amount, 0);
  const profit = totalIn - totalOut;

  const monthName = new Date(
    `${monthKey.slice(0, 4)}-${monthKey.slice(4)}-01`
  ).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const firstName = (user.name ?? workspace.name).split(" ")[0];
  const calcsUsed = usage?.pricingCalculationsCount ?? 0;

  const hasData =
    monthTransactions.length > 0 ||
    totalProducts > 0 ||
    recentCalculations.length > 0;

  return (
    <div className="relative min-h-full space-y-8">

      {/* ── Mesh background ──────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="bg-mesh pointer-events-none fixed inset-0 -z-10"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-700 via-rose-600 to-pink-500 p-6 text-white shadow-xl shadow-rose-300/40 md:p-8 lg:p-10">

        {/* Decorative yarn ball SVG — desktop right */}
        <YarnBallSvg className="pointer-events-none absolute -right-4 -top-4 h-52 w-52 opacity-60 lg:h-64 lg:w-64" />

        {/* Subtle rings */}
        <div aria-hidden="true" className="absolute bottom-0 left-12 h-48 w-48 translate-y-1/2 rounded-full bg-white/5" />
        <div aria-hidden="true" className="absolute bottom-8 left-8 h-24 w-24 translate-y-1/2 rounded-full bg-white/8" />

        <div className="relative max-w-2xl">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-rose-200 capitalize">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-300" aria-hidden="true" />
            {greeting()} · {monthName}
          </p>

          <h1 className="font-heading text-display mb-3 text-white">
            {greeting()}, {firstName}! 🧶
          </h1>

          <p className="mb-6 max-w-md text-base text-rose-100/90 md:text-lg">
            {hasData
              ? "Seu ateliê está em movimento. Aqui está o resumo do mês."
              : "Bem-vinda ao Trama Pro! Vamos começar?"}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/pricing/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            >
              <Calculator className="h-4 w-4" />
              Novo cálculo
            </Link>
            <Link
              href="/app/finance/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition-all hover:bg-white/25"
            >
              <TrendingUp className="h-4 w-4" />
              Registrar venda
            </Link>
          </div>
        </div>

        {/* Plan bar */}
        {plan === "FREE" && (
          <div className="relative mt-6 flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-2.5 text-sm text-white/90">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
              <span className="truncate">
                Plano Gratuito · <strong>{calcsUsed}/3</strong> cálculos usados este mês
              </span>
            </div>
            <Link
              href="/app/settings/billing"
              className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-900 transition hover:bg-amber-300"
            >
              Upgrade
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <section aria-label="Resumo financeiro do mês">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-title text-gray-900">
            Financeiro — {monthName}
          </h2>
          <Link
            href="/app/finance"
            className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
          >
            Detalhes <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Entradas"
            value={fmt(totalIn)}
            sub={`${monthTransactions.filter((t) => t.type === "IN").length} transações`}
            trend="up"
            variant="green"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <KpiCard
            label="Saídas"
            value={fmt(totalOut)}
            sub={`${monthTransactions.filter((t) => t.type === "OUT").length} transações`}
            trend="down"
            variant="red"
            icon={<TrendingDown className="h-4 w-4" />}
          />
          <KpiCard
            label="Lucro líquido"
            value={fmt(profit)}
            variant={profit >= 0 ? "rose" : "red"}
            trend={profit >= 0 ? "up" : "down"}
            goal={goal?.profitGoal ? { current: profit, target: goal.profitGoal } : undefined}
            icon={<Target className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* ── Stats pills ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Estatísticas rápidas">
        <StatPill value={totalProducts} label="Produtos ativos" icon="📦" />
        <StatPill value={calcsUsed} label="Cálculos este mês" icon="🧮" />
        <StatPill value={yarns.length} label="Tipos de fio" icon="🧵" />
        <Link href="/app/orders/board" className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm transition-shadow hover:shadow-md hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20">
          <span className="text-2xl" aria-hidden="true">📋</span>
          <p className="font-heading text-xs font-bold tracking-tight text-rose-700 dark:text-rose-400 text-center leading-tight">
            Ver quadro
          </p>
          <p className="text-center text-[11px] leading-tight text-rose-500 dark:text-rose-500">Acompanhar pedidos</p>
        </Link>
      </div>

      {/* ── Urgency Cards ─────────────────────────────────────────────────── */}
      {(lateOrders.length > 0 || dueSoonOrders.length > 0 || totalReceivable > 0 || lowStock.length > 0) && (
        <section aria-label="Alertas e urgências">
          <h2 className="font-heading text-title mb-4 text-gray-900 dark:text-white">
            Atenção necessária
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {lateOrders.length > 0 && (
              <Link
                href="/app/orders?filter=late"
                className="group flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    {lateOrders.length} pedido{lateOrders.length > 1 ? "s" : ""} atrasado{lateOrders.length > 1 ? "s" : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-red-600 dark:text-red-400">
                    {lateOrders.map((o) => o.customerName).join(", ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-red-400 transition group-hover:translate-x-0.5" />
              </Link>
            )}

            {dueSoonOrders.length > 0 && (
              <Link
                href="/app/orders"
                className="group flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/20"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {dueSoonOrders.length} entrega{dueSoonOrders.length > 1 ? "s" : ""} nos próximos 7 dias
                  </p>
                  <p className="mt-0.5 truncate text-xs text-amber-600 dark:text-amber-400">
                    {dueSoonOrders.map((o) => o.customerName).join(", ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-amber-400 transition group-hover:translate-x-0.5" />
              </Link>
            )}

            {totalReceivable > 0 && (
              <Link
                href="/app/orders?filter=UNPAID"
                className="group flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40">
                  <DollarSign className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                    {fmt(totalReceivable)} a receber
                  </p>
                  <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">
                    {unpaidOrders.length} pedido{unpaidOrders.length > 1 ? "s" : ""} com pagamento pendente
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-rose-400 transition group-hover:translate-x-0.5" />
              </Link>
            )}

            {lowStock.length > 0 && (
              <Link
                href="/app/inventory"
                className="group flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/20"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {lowStock.length} fio{lowStock.length > 1 ? "s" : ""} com estoque baixo
                  </p>
                  <p className="mt-0.5 truncate text-xs text-amber-600 dark:text-amber-400">
                    {lowStock.map((y) => `${y.brand} ${y.color}`).join(", ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-amber-400 transition group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Low stock alert (keep old one removed, now in urgency section) ─── */}
      {lowStock.length > 0 && false && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              {lowStock.length} fio{lowStock.length > 1 ? "s" : ""} com estoque baixo
            </p>
            <p className="mt-0.5 truncate text-xs text-amber-700">
              {lowStock.map((y) => `${y.brand} ${y.color}`).join(", ")}
            </p>
          </div>
          <Link
            href="/app/inventory"
            className="shrink-0 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            Ver estoque
          </Link>
        </div>
      )}

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <section aria-label="Ações rápidas">
        <h2 className="font-heading text-title mb-4 text-gray-900">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickAction
            href="/app/pricing/new"
            icon={<Calculator className="h-5 w-5" />}
            label="Calcular preço"
            description="Calcule o valor justo de uma peça"
            color="text-rose-500 hover:border-rose-200"
          />
          <QuickAction
            href="/app/finance/new"
            icon={<TrendingUp className="h-5 w-5" />}
            label="Nova transação"
            description="Registre uma venda ou gasto"
            color="text-emerald-500 hover:border-emerald-200"
          />
          <QuickAction
            href="/app/orders/new"
            icon={<ClipboardList className="h-5 w-5" />}
            label="Nova encomenda"
            description="Registre um pedido de cliente"
            color="text-pink-500 hover:border-pink-200"
          />
          <QuickAction
            href="/app/inventory/new"
            icon={<Archive className="h-5 w-5" />}
            label="Registrar fio"
            description="Adicione estoque ao inventário"
            color="text-amber-500 hover:border-amber-200"
          />
        </div>
      </section>

      {/* ── Recent Calculations ──────────────────────────────────────────── */}
      <section aria-label="Últimos cálculos de preço">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-title text-gray-900">
            Últimos cálculos
          </h2>
          <Link
            href="/app/pricing"
            className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentCalculations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
              <Calculator className="h-7 w-7 text-rose-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              Nenhum cálculo ainda
            </p>
            <p className="mt-1 max-w-xs text-xs text-gray-400">
              Calcule o preço justo de uma peça levando em conta horas, materiais e margem de lucro.
            </p>
            <Link
              href="/app/pricing/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              <Calculator className="h-4 w-4" />
              Fazer meu primeiro cálculo
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {recentCalculations.map((calc, idx) => {
              const totals = calc.totalsJson as { suggestedPrice?: number };
              return (
                <Link
                  key={calc.id}
                  href="/app/pricing"
                  className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 transition-colors last:border-0 hover:bg-rose-50/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 text-sm font-bold text-rose-600">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {calc.name ?? "Sem nome"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(calc.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-base font-bold text-rose-600">
                      {fmt(totals?.suggestedPrice ?? 0)}
                    </p>
                    <p className="text-[11px] text-gray-400">preço sugerido</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Empty state (no data at all) ─────────────────────────────────── */}
      {!hasData && (
        <section className="overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200/50">
            <Sparkles className="h-9 w-9 text-white" />
          </div>
          <h2 className="font-heading text-title mb-2 text-rose-900">
            Bem-vinda ao Trama Pro!
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-rose-600/80">
            Comece registrando um fio, calculando o preço de uma peça ou
            adicionando uma venda. Tudo fica organizado aqui.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/app/pricing/new"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/50 transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-lg"
            >
              <Calculator className="h-4 w-4" />
              Calcular preço de uma peça
            </Link>
            <Link
              href="/app/inventory/new"
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-md"
            >
              <Archive className="h-4 w-4" />
              Registrar fio
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
