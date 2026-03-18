import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar } from "@/components/admin/search-bar";
import { Users } from "lucide-react";
import { Suspense } from "react";

export const metadata = { title: "Usuários — Admin Trama Pro" };

async function getUsers(query?: string) {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      ownedWorkspaces: {
        select: {
          name: true,
          subscription: { select: { plan: true, status: true } },
          _count: { select: { materials: true, orders: true, products: true } },
        },
      },
    },
  });
}

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireAdmin();
  const { q } = await searchParams;
  const users = await getUsers(q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description={`${users.length} ${users.length === 1 ? "usuário encontrado" : "usuários encontrados"}`}
        action={
          <Suspense>
            <SearchBar placeholder="Buscar por nome ou email..." defaultValue={q} />
          </Suspense>
        }
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111118]">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-10 w-10 text-gray-700" />
            <p className="mt-3 text-sm font-medium text-gray-500">Nenhum usuário encontrado</p>
            {q && <p className="mt-1 text-xs text-gray-600">Tente outro termo de busca</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Usuário", "Workspace", "Plano", "Materiais", "Pedidos", "Cadastrado em"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user) => {
                  const ws = user.ownedWorkspaces[0];
                  const plan = ws?.subscription?.plan ?? "FREE";
                  return (
                    <tr key={user.id} className="group transition hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/15 text-xs font-semibold text-indigo-400">
                            {(user.name ?? user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-200">{user.name ?? "—"}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{ws?.name ?? "—"}</td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          label={plan}
                          variant={plan === "PREMIUM" ? "premium" : "neutral"}
                          dot
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-sm tabular-nums text-gray-400">
                        {ws?._count.materials ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center text-sm tabular-nums text-gray-400">
                        {ws?._count.orders ?? 0}
                      </td>
                      <td className="px-6 py-4 text-xs tabular-nums text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
