import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditTransactionForm } from "./edit-form";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { id } = await params;

  const tx = await prisma.transaction.findFirst({
    where: { id, workspaceId: workspace.id },
  });

  if (!tx) notFound();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Editar transação</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Corrija os dados da transação</p>
      </div>
      <EditTransactionForm
        id={tx.id}
        defaultValues={{
          type: tx.type as "IN" | "OUT",
          category: tx.category,
          amount: tx.amount,
          date: new Date(tx.date).toISOString().split("T")[0],
          notes: tx.notes ?? "",
        }}
      />
    </div>
  );
}
