import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Assinaturas — Admin Trama Pro" };

async function getSubscriptions() {
  return prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      workspace: {
        select: {
          name: true,
          owner: { select: { name: true, email: true } },
        },
      },
    },
  });
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  CANCELED: "bg-red-500/20 text-red-400",
  PAST_DUE: "bg-amber-500/20 text-amber-400",
  TRIALING: "bg-blue-500/20 text-blue-400",
};

const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-700 text-gray-300",
  PREMIUM: "bg-amber-500/20 text-amber-400",
};

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const subs = await getSubscriptions();

  const premium = subs.filter((s) => s.plan === "PREMIUM").length;
  const free = subs.filter((s) => s.plan === "FREE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assinaturas</h1>
        <p className="mt-1 text-sm text-gray-400">
          {subs.length} workspaces — {premium} Premium · {free} Free
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Free", value: free, color: "text-gray-300" },
          { label: "Premium", value: premium, color: "text-amber-400" },
          { label: "Ativos", value: subs.filter((s) => s.status === "ACTIVE").length, color: "text-emerald-400" },
          { label: "Cancelados", value: subs.filter((s) => s.status === "CANCELED").length, color: "text-red-400" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="mt-0.5 text-sm text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Workspace</th>
                <th className="px-6 py-3">Dono</th>
                <th className="px-6 py-3">Plano</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Vencimento</th>
                <th className="px-6 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {subs.map((s) => (
                <tr key={s.id} className="transition hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-white">{s.workspace.name}</td>
                  <td className="px-6 py-4">
                    <p className="text-white">{s.workspace.owner.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{s.workspace.owner.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[s.plan] ?? PLAN_BADGE.FREE}`}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[s.status] ?? ""}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {s.currentPeriodEnd
                      ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
