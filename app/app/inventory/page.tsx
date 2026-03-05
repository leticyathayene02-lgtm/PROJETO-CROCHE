import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Plus } from "lucide-react";

export default async function InventoryPage() {
  const { workspace } = await requireWorkspace();

  const yarns = await prisma.yarn.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-rose-900">
            Estoque de Fios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie seus fios e matérias-primas
          </p>
        </div>
        <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white shrink-0">
          <Link href="/app/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar fio
          </Link>
        </Button>
      </div>

      {/* Summary strip */}
      {yarns.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700 font-medium">
            {yarns.length} {yarns.length === 1 ? "fio cadastrado" : "fios cadastrados"}
          </span>
          {yarns.filter((y) => y.gramsAvailable < y.lowStockThreshold).length > 0 && (
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-600 font-medium">
              {yarns.filter((y) => y.gramsAvailable < y.lowStockThreshold).length} com estoque baixo
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {yarns.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
            <Package className="h-7 w-7 text-rose-500" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-rose-900">
            Nenhum fio cadastrado
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Adicione seus fios para acompanhar o estoque e calcular custos com precisão.
          </p>
          <Button
            asChild
            className="mt-6 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Link href="/app/inventory/new">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro fio
            </Link>
          </Button>
        </div>
      )}

      {/* Yarn cards grid */}
      {yarns.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {yarns.map((yarn) => {
            const isLowStock = yarn.gramsAvailable < yarn.lowStockThreshold;
            const costPerGram =
              yarn.gramsAvailable > 0
                ? yarn.costTotal / yarn.gramsAvailable
                : 0;

            return (
              <Card
                key={yarn.id}
                className="group relative overflow-hidden border border-rose-100 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Low stock accent bar */}
                {isLowStock && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-rose-500" />
                )}

                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
                      {yarn.brand}
                      {yarn.line && (
                        <span className="ml-1 font-normal text-muted-foreground">
                          — {yarn.line}
                        </span>
                      )}
                    </CardTitle>
                    {isLowStock && (
                      <Badge className="shrink-0 bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100">
                        Estoque baixo
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Color swatch + label */}
                  <div className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full border border-gray-200 shrink-0"
                      style={{ backgroundColor: yarn.color.startsWith("#") ? yarn.color : undefined }}
                    />
                    <span className="text-sm text-gray-700">{yarn.color}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-rose-50/60 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Disponível</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {yarn.gramsAvailable.toLocaleString("pt-BR")} g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Custo total</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        {yarn.costTotal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Custo/g</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-700">
                        {costPerGram.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 3,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Alerta abaixo de</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-700">
                        {yarn.lowStockThreshold.toLocaleString("pt-BR")} g
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
