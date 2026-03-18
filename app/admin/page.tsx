import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin — Trama Pro" };

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
      take: 8,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);
  return { totalUsers, totalWorkspaces, freePlans, premiumPlans, totalMaterials, totalOrders, totalTransactions, recentUsers };
}

export default async function AdminPage() {
  await requireAdmin();
  const stats = await getStats();

  const cards = [
    { label: "Usuários", value: stats.totalUsers, icon: "👥", color: "bg-indigo-500/10 text-indigo-400" },
    { label: "Workspaces", value: stats.totalWorkspaces, icon: "🏠", color: "bg-violet-500/10 text-violet-400" },
    { label: "Plano Free", value: stats.freePlans, icon: "🆓", color: "bg-gray-500/10 text-gray-400" },
    { label: "Plano Premium", value: stats.premiumPlans, icon: "⭐", color: "bg-amber-500/10 text-amber-400" },
    { label: "Materiais", value: stats.totalMaterials, icon: "🧶", color: "bg-rose-500/10 text-rose-400" },
    { label: "Pedidos", value: stats.totalOrders, icon: "📦", color: "bg-emerald-500/10 text-emerald-400" },
    { label: "Transações", value: stats.totalTransactions, icon: "💰", color: "bg-cyan-500/10 text-cyan-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="mt-1 text-sm text-gray-400">
          Resumo da plataforma Trama Pro
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-xl ${c.color}`}>
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="mt-0.5 text-sm text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">Cadastros Recentes</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {stats.recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-semibold text-indigo-400">
                  {(u.name ?? u.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{u.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(u.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
