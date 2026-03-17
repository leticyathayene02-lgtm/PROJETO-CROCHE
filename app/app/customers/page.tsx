import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Plus, Users, Instagram, Phone, MapPin } from "lucide-react";

function formatCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const params = await searchParams;
  const q = params.q ?? "";

  const where: Prisma.CustomerWhereInput = {
    workspaceId: workspace.id,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { instagram: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { amount: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie sua carteira de clientes e histórico de pedidos
          </p>
        </div>
        <Link
          href="/app/customers/new"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Nova cliente
        </Link>
      </div>

      {/* Search */}
      <form method="get" action="/app/customers" className="max-w-sm">
        <input
          name="q" type="search" defaultValue={q}
          placeholder="Buscar por nome ou @instagram..."
          className="w-full rounded-xl border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-rose-400 dark:focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </form>

      {/* List */}
      {customers.length === 0 ? (
        <div className="card-3d-strong flex flex-col items-center justify-center rounded-3xl border-0 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/20 dark:via-gray-950 dark:to-gray-950 px-6 py-16 text-center dark:border-rose-900/30">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200/50 dark:shadow-rose-900/20">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-rose-100">
            {q ? "Nenhuma cliente encontrada" : "Nenhuma cliente ainda"}
          </h2>
          <p className="mb-6 max-w-xs text-sm text-gray-700 dark:text-gray-400">
            {q
              ? "Tente outra busca."
              : "Cadastre suas clientes para vincular pedidos e ver o histórico de compras."}
          </p>
          {!q && (
            <Link
              href="/app/customers/new"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" />
              Cadastrar primeira cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => {
            const totalSpent = customer.orders.reduce((s, o) => s + o.amount, 0);
            return (
              <Link
                key={customer.id}
                href={`/app/customers/${customer.id}`}
                className="group flex flex-col gap-2 rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] p-4 shadow-sm transition hover:shadow-md dark:hover:shadow-black/10 sm:flex-row sm:items-center sm:gap-4"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white">
                  {customer.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {customer.instagram && (
                      <span className="flex items-center gap-1">
                        <Instagram className="h-3 w-3" /> {customer.instagram}
                      </span>
                    )}
                    {customer.whatsapp && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {customer.whatsapp}
                      </span>
                    )}
                    {customer.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {customer.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex shrink-0 items-center gap-4 text-right text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-300">
                      {formatCurrency(totalSpent)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {customer._count.orders} pedido{customer._count.orders !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="hidden text-xs text-gray-500 transition group-hover:block sm:block">
                    Ver →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
