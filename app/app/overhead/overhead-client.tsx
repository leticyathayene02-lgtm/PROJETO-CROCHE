"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { createOverheadCost, updateOverheadCost, deleteOverheadCost } from "./actions";

interface Cost {
  id: string;
  name: string;
  amount: number;
}

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(",", ".")) || 0;
}

// ── Inline edit row ─────────────────────────────────────────────────

function CostRow({
  cost,
  onDeleted,
  onUpdated,
}: {
  cost: Cost;
  onDeleted: (id: string) => void;
  onUpdated: (id: string, name: string, amount: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cost.name);
  const [amount, setAmount] = useState(String(cost.amount));
  const [pending, start] = useTransition();

  function handleSave() {
    const amt = parseAmount(amount);
    if (!name.trim() || amt <= 0) {
      toast.error("Preencha nome e valor.");
      return;
    }
    start(async () => {
      const res = await updateOverheadCost(cost.id, { name: name.trim(), amount: amt });
      if (res.success) {
        onUpdated(cost.id, name.trim(), amt);
        setEditing(false);
        toast.success("Custo atualizado.");
      } else {
        toast.error(res.error ?? "Erro ao atualizar.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Excluir "${cost.name}"?`)) return;
    start(async () => {
      const res = await deleteOverheadCost(cost.id);
      if (res.success) {
        onDeleted(cost.id);
        toast.success("Custo excluído.");
      } else {
        toast.error(res.error ?? "Erro ao excluir.");
      }
    });
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-rose-400 dark:focus:border-rose-500"
          placeholder="Nome do custo"
          disabled={pending}
        />
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
            className="flex-1 sm:w-28 sm:flex-none rounded-lg border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-rose-400 dark:focus:border-rose-500"
            placeholder="0,00"
            disabled={pending}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
            title="Salvar"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setName(cost.name); setAmount(String(cost.amount)); }}
            disabled={pending}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Cancelar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{cost.name}</p>
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tabular-nums shrink-0">
        {brl(cost.amount)}/mês
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
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
    </li>
  );
}

// ── Add form ─────────────────────────────────────────────────────────

function AddCostForm({ onAdded }: { onAdded: (cost: Cost) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseAmount(amount);
    if (!name.trim() || amt <= 0) {
      toast.error("Preencha nome e valor.");
      return;
    }
    start(async () => {
      const res = await createOverheadCost({ name: name.trim(), amount: amt });
      if (res.success) {
        toast.success("Custo adicionado.");
        setName("");
        setAmount("");
      } else {
        toast.error(res.error ?? "Erro ao adicionar.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-3 border-t border-gray-100 dark:border-white/8 sm:flex-row sm:items-center">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 min-w-0 rounded-lg border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-rose-400 dark:focus:border-rose-500 placeholder-gray-400"
        placeholder="Ex: Aluguel, Luz, Internet..."
        disabled={pending}
      />
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
          className="flex-1 sm:w-28 sm:flex-none rounded-lg border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-rose-400 dark:focus:border-rose-500 placeholder-gray-400"
          placeholder="R$/mês"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>
    </form>
  );
}

// ── Main ─────────────────────────────────────────────────────────────

export function OverheadClient({ initialCosts }: { initialCosts: Cost[] }) {
  const [costs, setCosts] = useState<Cost[]>(initialCosts);

  const total = costs.reduce((s, c) => s + c.amount, 0);

  return (
    <>
      {/* List */}
      <div className="rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] shadow-sm overflow-hidden">
        {costs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum custo fixo cadastrado.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Use o formulário abaixo para adicionar.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-white/5">
            {costs.map((cost) => (
              <CostRow
                key={cost.id}
                cost={cost}
                onDeleted={(id) => setCosts((prev) => prev.filter((c) => c.id !== id))}
                onUpdated={(id, name, amount) =>
                  setCosts((prev) => prev.map((c) => (c.id === id ? { ...c, name, amount } : c)))
                }
              />
            ))}
          </ul>
        )}

        {/* Add form */}
        <AddCostForm
          onAdded={(cost) => setCosts((prev) => [...prev, cost])}
        />
      </div>

      {/* Total */}
      {costs.length > 0 && (
        <div className="rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total mensal</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{costs.length} custo{costs.length > 1 ? "s" : ""} fixo{costs.length > 1 ? "s" : ""}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{brl(total)}</p>
        </div>
      )}
    </>
  );
}
