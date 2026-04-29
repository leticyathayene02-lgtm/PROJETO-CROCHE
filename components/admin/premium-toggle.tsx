"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PremiumToggleProps {
  userId: string;
  initialGranted: boolean;
  disabled?: boolean;
}

export function PremiumToggle({ userId, initialGranted, disabled }: PremiumToggleProps) {
  const router = useRouter();
  const [granted, setGranted] = useState(initialGranted);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function setValue(next: boolean) {
    if (next === granted || isPending || disabled) return;
    setError(null);
    const previous = granted;
    setGranted(next);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/premium`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grant: next }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Falha ao atualizar.");
        }
        router.refresh();
      } catch (e) {
        setGranted(previous);
        setError(e instanceof Error ? e.message : "Erro inesperado.");
      }
    });
  }

  if (disabled) {
    return <span className="text-xs text-gray-600">—</span>;
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div
        role="group"
        aria-label="Liberar acesso premium gratuito"
        className="inline-flex overflow-hidden rounded-full ring-1 ring-inset ring-white/10"
      >
        <button
          type="button"
          onClick={() => setValue(true)}
          disabled={isPending}
          className={cn(
            "px-3 py-1 text-xs font-semibold transition",
            granted
              ? "bg-emerald-500/20 text-emerald-300"
              : "text-gray-500 hover:text-gray-300",
            isPending && "opacity-60"
          )}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => setValue(false)}
          disabled={isPending}
          className={cn(
            "px-3 py-1 text-xs font-semibold transition",
            !granted
              ? "bg-red-500/20 text-red-300"
              : "text-gray-500 hover:text-gray-300",
            isPending && "opacity-60"
          )}
        >
          Não
        </button>
      </div>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
