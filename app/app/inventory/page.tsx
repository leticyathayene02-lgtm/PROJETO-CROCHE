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
import { Archive, Plus, Pencil, Trash2 } from "lucide-react";
import { deleteStockItem } from "./actions";

export default async function InventoryPage() {
  const { workspace } = await requireWorkspace();

  const items = await prisma.stockItem.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Estoque
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Peças prontas disponíveis para venda
          </p>
        </div>
        <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white shrink-0">
          <Link href="/app/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar peça
          </Link>
        </Button>
      </div>

      {/* Summary strip */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-rose-50 dark:bg-rose-950/20 px-3 py-1 text-gray-900 dark:text-white font-medium">
            {items.length} {items.length === 1 ? "tipo de peça" : "tipos de peça"}
          </span>
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 text-emerald-700 dark:text-emerald-400 font-medium">
            {totalItems} {totalItems === 1 ? "unidade" : "unidades"} em estoque
          </span>
          {items.filter((i) => i.quantity === 0).length > 0 && (
            <span className="rounded-full bg-red-50 dark:bg-red-900/40 px-3 py-1 text-red-600 dark:text-red-400 font-medium">
              {items.filter((i) => i.quantity === 0).length} sem estoque
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/20 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
            <Archive className="h-7 w-7 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            Nenhuma peça em estoque
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Adicione suas peças prontas para controlar o que está disponível para venda.
          </p>
          <Button
            asChild
            className="mt-6 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Link href="/app/inventory/new">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeira peça
            </Link>
          </Button>
        </div>
      )}

      {/* Stock items grid */}
      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden card-3d border-0 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Out of stock accent bar */}
              {item.quantity === 0 && (
                <div className="absolute inset-x-0 top-0 h-1 bg-red-500" />
              )}

              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                    {item.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.quantity === 0 && (
                      <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/40">
                        Esgotado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Color + Size */}
                {(item.color || item.size) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.color && (
                      <span className="rounded-full bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                        {item.color}
                      </span>
                    )}
                    {item.size && (
                      <span className="rounded-full bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                        {item.size}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                      {item.quantity} {item.quantity === 1 ? "un" : "un"}
                    </p>
                  </div>
                  {item.price != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Preço de venda</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                        {item.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  )}
                  {item.cost != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Custo</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.cost.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  )}
                  {item.price != null && item.quantity > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Valor total</p>
                      <p className="mt-0.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        {(item.price * item.quantity).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 border-rose-200 dark:border-rose-800/40 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Link href={`/app/inventory/${item.id}/edit`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Link>
                  </Button>
                  <form
                    action={async () => {
                      "use server";
                      await deleteStockItem(item.id);
                    }}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
