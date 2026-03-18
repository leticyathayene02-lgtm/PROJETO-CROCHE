import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Usuários — Admin Trama Pro" };

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      ownedWorkspaces: {
        select: {
          id: true,
          name: true,
          subscription: { select: { plan: true, status: true } },
          _count: { select: { materials: true, orders: true, products: true } },
        },
      },
    },
  });
}

const PLAN_BADGE: Record<string, string> = {
  FREE: "bg-gray-700 text-gray-300",
  PREMIUM: "bg-amber-500/20 text-amber-400",
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="mt-1 text-sm text-gray-400">{users.length} usuários cadastrados</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">Workspace</th>
                <th className="px-6 py-3">Plano</th>
                <th className="px-6 py-3 text-center">Materiais</th>
                <th className="px-6 py-3 text-center">Pedidos</th>
                <th className="px-6 py-3 text-center">Produtos</th>
                <th className="px-6 py-3">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => {
                const ws = user.ownedWorkspaces[0];
                const plan = ws?.subscription?.plan ?? "FREE";
                return (
                  <tr key={user.id} className="transition hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-semibold text-indigo-400">
                          {(user.name ?? user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{ws?.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[plan] ?? PLAN_BADGE.FREE}`}>
                        {plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-300">{ws?._count.materials ?? 0}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{ws?._count.orders ?? 0}</td>
                    <td className="px-6 py-4 text-center text-gray-300">{ws?._count.products ?? 0}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
