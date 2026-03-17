import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { updateCustomer, deleteCustomer } from "@/lib/customers/actions";
import { ChevronLeft, Instagram, Phone, MapPin, ShoppingBag } from "lucide-react";

function formatCurrency(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

const paymentColors: Record<string, string> = {
  UNPAID: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
  HALF_PAID: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
  PAID: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
};
const paymentLabels: Record<string, string> = {
  UNPAID: "Não pago",
  HALF_PAID: "50% pago",
  PAID: "Pago",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      orders: {
        orderBy: { orderDate: "desc" },
        take: 10,
        select: {
          id: true,
          orderDate: true,
          dueDate: true,
          itemDescription: true,
          amount: true,
          paymentStatus: true,
          productionStatus: true,
        },
      },
    },
  });

  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((s, o) => s + o.amount, 0);
  const updateWithId = updateCustomer.bind(null, customer.id);
  const deleteWithId = deleteCustomer.bind(null, customer.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/app/customers"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar às clientes
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-lg font-bold text-white">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
            <div className="flex flex-wrap gap-x-3 text-xs text-gray-400">
              {customer.instagram && <span className="flex items-center gap-1"><Instagram className="h-3 w-3" /> {customer.instagram}</span>}
              {customer.whatsapp && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.whatsapp}</span>}
              {customer.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer.city}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="card-3d rounded-2xl border-0 bg-rose-50 dark:bg-rose-950/20 p-4 text-center dark:border-rose-900/30">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.orders.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pedidos</p>
        </div>
        <div className="rounded-2xl border border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-950/20 p-4 text-center">
          <p className="text-lg font-bold text-green-700 dark:text-green-400">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total gasto</p>
        </div>
        {customer.orders[0] && (
          <div className="rounded-2xl border border-gray-100 dark:border-white/8 bg-gray-50 dark:bg-[oklch(0.15_0.008_280)] p-4 text-center">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatDate(customer.orders[0].orderDate)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Último pedido</p>
          </div>
        )}
      </div>

      {/* Recent orders */}
      {customer.orders.length > 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/8 px-4 py-3">
            <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Histórico de pedidos</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/app/orders/${order.id}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-rose-50/50 dark:hover:bg-white/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{order.itemDescription}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.orderDate)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${paymentColors[order.paymentStatus]}`}>
                    {paymentLabels[order.paymentStatus]}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                    {formatCurrency(order.amount)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="rounded-3xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">Editar dados</h2>
        <CustomerForm
          action={updateWithId}
          submitLabel="Salvar alterações"
          defaultValues={{
            name: customer.name,
            instagram: customer.instagram ?? "",
            whatsapp: customer.whatsapp ?? "",
            city: customer.city ?? "",
            notes: customer.notes ?? "",
          }}
        />
      </div>

      {/* Delete */}
      <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 p-4">
        <p className="mb-3 text-sm font-medium text-red-700 dark:text-red-400">
          Excluir esta cliente permanentemente
        </p>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-transparent px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={(e) => {
              if (!confirm("Excluir esta cliente? Os pedidos vinculados não serão apagados.")) {
                e.preventDefault();
              }
            }}
          >
            Excluir cliente
          </button>
        </form>
      </div>
    </div>
  );
}
