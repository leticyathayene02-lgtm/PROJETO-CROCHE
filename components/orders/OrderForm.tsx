"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CHANNELS, paymentStatusLabels } from "@/lib/orders/validators";

type FormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    orderDate?: string;
    customerName?: string;
    itemDescription?: string;
    dueDate?: string;
    amount?: number;
    paymentStatus?: string;
    notes?: string;
    channel?: string;
  };
  submitLabel?: string;
};

const inputCls =
  "w-full rounded-xl border border-rose-200 bg-white/80 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-500";

const labelCls = "mb-1.5 block text-sm font-medium text-rose-800 dark:text-rose-300";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function OrderForm({ action, defaultValues = {}, submitLabel = "Salvar pedido" }: FormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(fd);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Order date */}
        <div>
          <label htmlFor="orderDate" className={labelCls}>
            Data do pedido
          </label>
          <input
            id="orderDate"
            name="orderDate"
            type="date"
            required
            defaultValue={defaultValues.orderDate ?? todayISO()}
            className={inputCls}
            disabled={isPending}
          />
        </div>

        {/* Due date */}
        <div>
          <label htmlFor="dueDate" className={labelCls}>
            Data prevista de entrega <span className="text-rose-500">*</span>
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            required
            defaultValue={defaultValues.dueDate ?? ""}
            className={inputCls}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Customer name */}
      <div>
        <label htmlFor="customerName" className={labelCls}>
          Nome da cliente <span className="text-rose-500">*</span>
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          required
          defaultValue={defaultValues.customerName ?? ""}
          placeholder="Ex: Maria Silva"
          className={inputCls}
          disabled={isPending}
        />
      </div>

      {/* Item description */}
      <div>
        <label htmlFor="itemDescription" className={labelCls}>
          Descrição da peça <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="itemDescription"
          name="itemDescription"
          required
          rows={3}
          defaultValue={defaultValues.itemDescription ?? ""}
          placeholder="Ex: Bolsa de crochê cor areia, alça curta, tamanho médio"
          className={`${inputCls} resize-none`}
          disabled={isPending}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className={labelCls}>
            Valor (R$) <span className="text-rose-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={defaultValues.amount ?? ""}
            placeholder="0,00"
            className={inputCls}
            disabled={isPending}
          />
        </div>

        {/* Payment status */}
        <div>
          <label htmlFor="paymentStatus" className={labelCls}>
            Status de pagamento <span className="text-rose-500">*</span>
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            required
            defaultValue={defaultValues.paymentStatus ?? "UNPAID"}
            className={inputCls}
            disabled={isPending}
          >
            {Object.entries(paymentStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Channel */}
      <div>
        <label htmlFor="channel" className={labelCls}>
          Canal de venda (opcional)
        </label>
        <select
          id="channel"
          name="channel"
          defaultValue={defaultValues.channel ?? ""}
          className={inputCls}
          disabled={isPending}
        >
          <option value="">Selecionar canal</option>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelCls}>
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={defaultValues.notes ?? ""}
          placeholder="Detalhes extras, cor específica, prazo de urgência..."
          className={`${inputCls} resize-none`}
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
