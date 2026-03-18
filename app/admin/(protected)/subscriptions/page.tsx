import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchBar } from "@/components/admin/search-bar";
import { CreditCard, Star, CheckCircle, XCircle } from "lucide-react";
import { Suspense } from "react";

export const metadata = { title: "Assinaturas — Admin Trama Pro" };

async function getSubscriptions(query?: string) {
  return prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    where: query
      ? {
          OR: [
            { workspace: { name: { contains: query, mode: "insensitive" } } },
            { workspace: { owner: { email: { contains: query, mode: "insensitive" } } } },
          ],
        }
      : undefined,
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

const STATUS_VARIANT = {
  ACTIVE: "success",
  CANCELED: "danger",
  PAST_DUE: "warning",
  TRIALING: "info",
} as const;

const STATUS_LABEL = {
  ACTIVE: "Ativo",
  CANCELED: "Cancelado",
  PAST_DUE: "Vencido",
  TRIALING: "Trial",
} as const;

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminSubscriptionsPage({ searchParams }: Props) {
  await requireAdmin();
  const { q } = await searchParams;
  const subs = await getSubscriptions(q);

  const total = subs.length;
  const premium = subs.filter((s) => s.plan === "PREMIUM").length;
  const free = subs.filter((s) => s.plan === "FREE").length;
  const active = subs.filter((s) => s.status === "ACTIVE").length;
  const canceled = subs.filter((s) => s.status === "CANCELED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assinaturas"
        description={`${total} ${total === 1 ? "registro" : "registros"}`}
        action={
          <Suspense>
            <SearchBar placeholder="Buscar workspace ou email..." defaultValue={q} />
          </Suspense>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Premium" value={premium} icon={Star} accent="amber" />
        <StatCard label="Free" value={free} icon={CreditCard} accent="indigo" />
        <StatCard label="Ativos" value={active} icon={CheckCircle} accent="emerald" />
        <StatCard label="Cancelados" value={canceled} icon={XCircle} accent="rose" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#111118]">
        {subs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CreditCard className="h-10 w-10 text-gray-700" />
            <p className="mt-3 text-sm font-medium text-gray-500">Nenhuma assinatura encontrada</p>
            {q && <p className="mt-1 text-xs text-gray-600">Tente outro termo de busca</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Workspace", "Proprietário", "Plano", "Status", "Vencimento", "Criado em"].map((h) => (
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
                {subs.map((s) => (
                  <tr key={s.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-200">{s.workspace.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{s.workspace.owner.name ?? "—"}</p>
                      <p className="text-xs text-gray-600">{s.workspace.owner.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={s.plan}
                        variant={s.plan === "PREMIUM" ? "premium" : "neutral"}
                        dot
                      />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        label={STATUS_LABEL[s.status] ?? s.status}
                        variant={STATUS_VARIANT[s.status] ?? "neutral"}
                        dot
                      />
                    </td>
                    <td className="px-6 py-4 text-xs tabular-nums text-gray-500">
                      {s.currentPeriodEnd
                        ? new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-xs tabular-nums text-gray-600">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
