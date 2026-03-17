import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaterialCard } from "./material-card";

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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/20 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/40">
            <Package className="h-7 w-7 text-gray-500 dark:text-gray-400" />
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
          {materials.map((m) => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </div>
      )}
    </div>
  );
}
