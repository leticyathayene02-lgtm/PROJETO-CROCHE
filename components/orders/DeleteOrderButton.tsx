"use client";

import { useTransition, useState } from "react";

interface Props {
  action: () => Promise<void>;
}

export function DeleteOrderButton({ action }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      await action();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      onBlur={() => !isPending && setConfirming(false)}
      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
    >
      {isPending
        ? "Excluindo..."
        : confirming
        ? "Confirmar exclusão?"
        : "Excluir pedido"}
    </button>
  );
}
