"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

type FormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    name?: string;
    instagram?: string;
    whatsapp?: string;
    city?: string;
    notes?: string;
  };
  submitLabel?: string;
};

const inputCls =
  "w-full rounded-xl border border-rose-200 bg-white/80 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20";

const labelCls = "mb-1.5 block text-sm font-medium text-rose-800 dark:text-rose-200";

export function CustomerForm({ action, defaultValues = {}, submitLabel = "Salvar" }: FormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await action(fd); });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelCls}>
          Nome <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>
        <input
          id="name" name="name" type="text" required
          defaultValue={defaultValues.name ?? ""}
          placeholder="Ex: Maria Silva"
          className={inputCls} disabled={isPending}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="instagram" className={labelCls}>Instagram (opcional)</label>
          <input
            id="instagram" name="instagram" type="text"
            defaultValue={defaultValues.instagram ?? ""}
            placeholder="@mariasilva"
            className={inputCls} disabled={isPending}
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className={labelCls}>WhatsApp (opcional)</label>
          <input
            id="whatsapp" name="whatsapp" type="text"
            defaultValue={defaultValues.whatsapp ?? ""}
            placeholder="(11) 99999-9999"
            className={inputCls} disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label htmlFor="city" className={labelCls}>Cidade (opcional)</label>
        <input
          id="city" name="city" type="text"
          defaultValue={defaultValues.city ?? ""}
          placeholder="Ex: São Paulo"
          className={inputCls} disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelCls}>Observações (opcional)</label>
        <textarea
          id="notes" name="notes" rows={3}
          defaultValue={defaultValues.notes ?? ""}
          placeholder="Preferências, histórico, detalhes importantes..."
          className={`${inputCls} resize-none`} disabled={isPending}
        />
      </div>

      <Button
        type="submit" disabled={isPending}
        className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
