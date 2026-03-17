"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteMaterial } from "@/lib/materials/actions";

const CATEGORY_LABELS: Record<string, string> = {
  YARN: "Fio / Lã",
  FILLING: "Enchimento",
  EYES: "Olhos",
  LABEL: "Etiqueta",
  BUTTON: "Botão",
  ZIPPER: "Zíper",
  RING: "Argola",
  PACKAGING: "Embalagem",
  TAG: "Tag",
  GIFT: "Mimo",
  OTHER: "Outro",
};

const CATEGORY_COLORS: Record<string, string> = {
  YARN: "bg-rose-100 text-gray-900 dark:bg-rose-900/40 dark:text-rose-400",
  FILLING: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  EYES: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  LABEL: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  BUTTON: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  PACKAGING: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const UNIT_LABELS: Record<string, string> = {
  GRAMS: "g",
  METERS: "m",
  UNITS: "un",
  PACKS: "pct",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface MaterialCardProps {
  material: {
    id: string;
    name: string;
    category: string;
    brand: string | null;
    color: string | null;
    unit: string;
    costPerUnit: number;
    stock: number;
    lowStockMin: number;
    supplier: string | null;
    weightPerRoll: number | null;
    pricePerRoll: number | null;
    rolls: number | null;
  };
}

export function MaterialCard({ material: m }: MaterialCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isLow = m.lowStockMin > 0 && m.stock < m.lowStockMin;
  const unit = UNIT_LABELS[m.unit] ?? m.unit;

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    const result = await deleteMaterial(m.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Material excluído");
    router.refresh();
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-[oklch(0.18_0.01_280)] p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Low stock badge */}
      {isLow && (
        <div className="absolute right-3 top-3">
          <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Baixo
          </span>
        </div>
      )}

      {/* Category badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[m.category] ?? CATEGORY_COLORS.OTHER}`}
        >
          {CATEGORY_LABELS[m.category] ?? m.category}
        </span>
      </div>

      {/* Name & details */}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</h3>
      {(m.brand || m.color) && (
        <p className="mt-0.5 text-xs text-gray-400">
          {[m.brand, m.color].filter(Boolean).join(" · ")}
        </p>
      )}

      {/* Cost & stock */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 dark:bg-[oklch(0.15_0.008_280)] px-3 py-2">
          <p className="text-[10px] text-gray-400">Custo/{unit}</p>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{fmt(m.costPerUnit)}</p>
        </div>
        <div
          className={`rounded-lg px-3 py-2 ${isLow ? "bg-amber-50 dark:bg-amber-950/20" : "bg-gray-50 dark:bg-[oklch(0.15_0.008_280)]"}`}
        >
          <p className="text-[10px] text-gray-400">Estoque</p>
          <p
            className={`text-sm font-bold ${isLow ? "text-amber-700 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}
          >
            {m.stock} {unit}
          </p>
        </div>
      </div>

      {/* Yarn roll info */}
      {m.category === "YARN" && m.rolls != null && m.rolls > 0 && (
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>🧶 {m.rolls} {m.rolls === 1 ? "rolo" : "rolos"}</span>
          {m.weightPerRoll != null && m.weightPerRoll > 0 && (
            <span>· {m.weightPerRoll}g/rolo</span>
          )}
          {m.pricePerRoll != null && m.pricePerRoll > 0 && (
            <span>· {fmt(m.pricePerRoll)}/rolo</span>
          )}
        </div>
      )}

      {m.supplier && (
        <p className="mt-2 text-xs text-gray-400">Fornecedor: {m.supplier}</p>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-2 border-t border-gray-100 dark:border-white/5 pt-3">
        <Link
          href={`/app/materials/${m.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Link>

        {confirmDelete ? (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-red-500 dark:text-red-400">Excluir?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sim"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Não
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
