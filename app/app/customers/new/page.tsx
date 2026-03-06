import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { createCustomer } from "@/lib/customers/actions";
import { ChevronLeft } from "lucide-react";

export default async function NewCustomerPage() {
  await requireWorkspace();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/app/customers"
          className="mb-4 inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 dark:text-rose-400"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar às clientes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova cliente</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cadastre os dados da cliente para vincular pedidos e histórico.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-white/3">
        <CustomerForm action={createCustomer} submitLabel="Cadastrar cliente" />
      </div>
    </div>
  );
}
