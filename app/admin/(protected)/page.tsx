import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Users,
  Star,
  Package,
  ShoppingBag,
  ArrowUpRight,
  Activity,
} from "lucide-react";

export const metadata = { title: "Dashboard — Admin Trama Pro" };

async function getStats() {
  const [
    totalUsers,
    totalWorkspaces,
    freePlans,
    premiumPlans,
    totalMaterials,
    totalOrders,
    totalTransactions,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.subscription.count({ where: { plan: "FREE" } }),
    prisma.subscription.count({ where: { plan: "PREMIUM" } }),
    prisma.material.count(),
    prisma.order.count(),
    prisma.transaction.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        ownedWorkspaces: {
          select: { subscription: { select: { plan: true } } },
        },
      },
    }),
  ]);
  return { totalUsers, totalWorkspaces, freePlans, premiumPlans, totalMaterials, totalOrders, totalTransactions, recentUsers };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getStats();

  const conversionRate =
    stats.totalUsers > 0
      ? ((stats.premiumPlans / stats.totalUsers) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Visão geral da plataforma Trama Pro" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Usuários" value={stats.totalUsers} icon={Users} description={`${stats.totalWorkspaces} workspaces`} accent="indigo" />
        <StatCard label="Plano Premium" value={stats.premiumPlans} icon={Star} description={`${stats.freePlans} no plano free`} accent="amber" />
        <StatCard label="Pedidos" value={stats.totalOrders} icon={ShoppingBag} description="total na plataforma" accent="emerald" />
        <StatCard label="Materiais" value={stats.totalMaterials} icon={Package} description={`${stats.totalTransactions} transações`} accent="violet" />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversão */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Taxa de conversão</p>
            <Activity className="h-4 w-4 text-gray-600" />
          </div>
          <p className="mt-3 text-4xl font-semibold text-white">{conversionRate}%</p>
          <p className="mt-1 text-xs text-gray-500">free → premium</p>
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${conversionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Planos */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Distribuição de planos</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-300"><span className="h-2 w-2 rounded-full bg-gray-500" />Free</span>
              <span className="text-sm font-medium tabular-nums text-white">{stats.freePlans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-300"><span className="h-2 w-2 rounded-full bg-amber-400" />Premium</span>
              <span className="text-sm font-medium tabular-nums text-white">{stats.premiumPlans}</span>
            </div>
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
            {stats.totalWorkspaces > 0 && (
              <>
                <div className="h-full bg-gray-600" style={{ width: `${(stats.freePlans / stats.totalWorkspaces) * 100}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${(stats.premiumPlans / stats.totalWorkspaces) * 100}%` }} />
              </>
            )}
          </div>
        </div>

        {/* Dados rápidos */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Dados da plataforma</p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Workspaces", value: stats.totalWorkspaces },
              { label: "Materiais cadastrados", value: stats.totalMaterials },
              { label: "Pedidos registrados", value: stats.totalOrders },
              { label: "Transações", value: stats.totalTransactions },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium tabular-nums text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111118]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Cadastros recentes</h2>
            <p className="mt-0.5 text-xs text-gray-500">Últimos 10 usuários</p>
          </div>
          <a href="/admin/users" className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition hover:text-indigo-300">
            Ver todos <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {stats.recentUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-8 w-8 text-gray-700" />
              <p className="mt-3 text-sm text-gray-600">Nenhum usuário cadastrado</p>
            </div>
          ) : (
            stats.recentUsers.map((u) => {
              const plan = u.ownedWorkspaces[0]?.subscription?.plan ?? "FREE";
              return (
                <div key={u.id} className="flex items-center justify-between px-6 py-3.5 transition hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-400">
                      {(u.name ?? u.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{u.name ?? "—"}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge label={plan} variant={plan === "PREMIUM" ? "premium" : "neutral"} />
                    <span className="hidden text-xs tabular-nums text-gray-600 sm:block">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
