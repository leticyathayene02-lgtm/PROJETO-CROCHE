"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTransaction } from "./actions";

export function TransactionActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Excluir esta transação? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast.success("Transação excluída.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao excluir.");
      }
    });
  }

  return (
    <div className="flex items-center gap-1 shrink-0 ml-3">
      <Link
        href={`/app/finance/${id}/edit`}
        className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
        title="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
        title="Excluir"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
