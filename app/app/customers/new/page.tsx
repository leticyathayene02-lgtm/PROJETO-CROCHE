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
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar às clientes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova cliente</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cadastre os dados da cliente para vincular pedidos e histórico.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] p-6 shadow-sm">
        <CustomerForm action={createCustomer} submitLabel="Cadastrar cliente" />
      </div>
    </div>
  );
}
