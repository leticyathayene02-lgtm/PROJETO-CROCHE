"use client";

import { useTransition } from "react";

interface DeleteCustomerButtonProps {
  action: () => Promise<void>;
}

export function DeleteCustomerButton({ action }: DeleteCustomerButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-transparent px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
      onClick={() => {
        if (!confirm("Excluir esta cliente? Os pedidos vinculados não serão apagados.")) {
          return;
        }
        startTransition(async () => {
          await action();
        });
      }}
    >
      {isPending ? "Excluindo..." : "Excluir cliente"}
    </button>
  );
}
