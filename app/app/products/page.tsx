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
import { ShoppingBag, Plus } from "lucide-react";
import type { ProductStatus } from "@prisma/client";

// ─────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────

function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<
    ProductStatus,
    { label: string; className: string }
  > = {
    ACTIVE: {
      label: "Ativo",
      className: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
    },
    DRAFT: {
      label: "Rascunho",
      className: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40",
    },
    ARCHIVED: {
      label: "Arquivado",
      className: "bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10",
    },
  };

  const { label, className } = map[status];
  return <Badge className={className}>{label}</Badge>;
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default async function ProductsPage() {
  const { workspace } = await requireWorkspace();

  const products = await prisma.product.findMany({
    where: {
      workspaceId: workspace.id,
      status: { not: "ARCHIVED" },
    },
    include: {
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const archivedCount = await prisma.product.count({
    where: { workspaceId: workspace.id, status: "ARCHIVED" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Produtos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catálogo de peças e coleções do seu ateliê
          </p>
        </div>
        <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white shrink-0">
          <Link href="/app/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </div>

      {/* Summary strip */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-rose-50 dark:bg-rose-950/20 px-3 py-1 text-gray-900 dark:text-white font-medium">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </span>
          {archivedCount > 0 && (
            <span className="rounded-full bg-gray-100 dark:bg-white/8 px-3 py-1 text-gray-500 dark:text-gray-400 font-medium">
              {archivedCount} arquivado{archivedCount !== 1 && "s"}
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/20 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
            <ShoppingBag className="h-7 w-7 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            Nenhum produto cadastrado
          </h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Crie seu catálogo de peças e organize variações de cor, tamanho e preço.
          </p>
          <Button
            asChild
            className="mt-6 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Link href="/app/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro produto
            </Link>
          </Button>
        </div>
      )}

      {/* Product cards grid */}
      {products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group card-3d border-0 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                    {product.name}
                  </CardTitle>
                  <StatusBadge status={product.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Description */}
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Variants count + preview */}
                <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/20 px-3 py-2.5">
                  {product.variants.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Sem variações cadastradas
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {product.variants.length}{" "}
                        {product.variants.length === 1 ? "variação" : "variações"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants.slice(0, 3).map((v) => (
                          <span
                            key={v.id}
                            className="rounded-full bg-white dark:bg-[oklch(0.18_0.01_280)] border border-rose-200 dark:border-rose-800/40 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
                          >
                            {[v.color, v.size].filter(Boolean).join(" / ") || v.sku || "—"}
                          </span>
                        ))}
                        {product.variants.length > 3 && (
                          <span className="rounded-full bg-white dark:bg-[oklch(0.18_0.01_280)] border border-rose-200 dark:border-rose-800/40 px-2 py-0.5 text-xs text-gray-400">
                            +{product.variants.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price range */}
                {product.variants.some((v) => v.price !== null) && (() => {
                  const prices = product.variants
                    .map((v) => v.price)
                    .filter((p): p is number => p !== null);
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  return (
                    <p className="text-xs text-muted-foreground">
                      Preço:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {min === max
                          ? min.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : `${min.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })} – ${max.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}`}
                      </span>
                    </p>
                  );
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
