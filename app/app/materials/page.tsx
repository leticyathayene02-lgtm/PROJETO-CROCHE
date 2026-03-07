import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  YARN: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
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

export default async function MaterialsPage() {
  const { workspace } = await requireWorkspace();

  const materials = await prisma.material.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
            Catálogo de Materiais
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cadastre insumos uma vez e use na precificação
          </p>
        </div>
        <Button asChild className="bg-rose-600 hover:bg-rose-700">
          <Link href="/app/materials/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo material
          </Link>
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 py-16 text-center dark:border-rose-900/30 dark:bg-rose-950/10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/40">
            <Package className="h-7 w-7 text-rose-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Nenhum material cadastrado
          </p>
          <p className="mt-1 max-w-xs text-xs text-gray-400">
            Cadastre fios, enchimentos, etiquetas e outros insumos para usar na calculadora de preços.
          </p>
          <Button asChild className="mt-5 bg-rose-600 hover:bg-rose-700">
            <Link href="/app/materials/new">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar primeiro material
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => {
            const isLow = m.lowStockMin > 0 && m.stock < m.lowStockMin;
            const unit = UNIT_LABELS[m.unit] ?? m.unit;
            return (
              <div
                key={m.id}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                {isLow && (
                  <div className="absolute right-3 top-3">
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      Baixo
                    </span>
                  </div>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[m.category] ?? CATEGORY_COLORS.OTHER}`}>
                    {CATEGORY_LABELS[m.category] ?? m.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {m.name}
                </h3>
                {(m.brand || m.color) && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {[m.brand, m.color].filter(Boolean).join(" · ")}
                  </p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                    <p className="text-[10px] text-gray-400">Custo/{unit}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {fmt(m.costPerUnit)}
                    </p>
                  </div>
                  <div className={`rounded-lg px-3 py-2 ${isLow ? "bg-amber-50 dark:bg-amber-950/20" : "bg-gray-50 dark:bg-gray-800"}`}>
                    <p className="text-[10px] text-gray-400">Estoque</p>
                    <p className={`text-sm font-bold ${isLow ? "text-amber-700 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}>
                      {m.stock} {unit}
                    </p>
                  </div>
                </div>
                {m.supplier && (
                  <p className="mt-2 text-xs text-gray-400">
                    Fornecedor: {m.supplier}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
