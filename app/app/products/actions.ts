"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";
import { checkProductLimit } from "@/lib/limits";

// ─────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────

const productStatusSchema = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);

const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, "Preço não pode ser negativo").optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional(),
  status: productStatusSchema,
  variant: variantSchema.optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─────────────────────────────────────────
// createProduct
// ─────────────────────────────────────────

export async function createProduct(data: ProductFormData): Promise<
  | { success: true; productId: string }
  | { success: false; error: string; upgradeRequired?: boolean }
> {
  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return { success: false, error: firstError };
  }

  let workspaceId: string;
  try {
    const { workspace } = await requireWorkspace();
    workspaceId = workspace.id;
  } catch {
    return { success: false, error: "Não autorizado" };
  }

  // Check plan limit
  const limitCheck = await checkProductLimit(workspaceId);
  if (!limitCheck.allowed) {
    return {
      success: false,
      error: limitCheck.reason,
      upgradeRequired: true,
    };
  }

  try {
    const { name, description, status, variant } = parsed.data;

    const hasVariant =
      variant &&
      (variant.color || variant.size || variant.sku || variant.price !== undefined);

    const product = await prisma.product.create({
      data: {
        workspaceId,
        name,
        description: description ?? null,
        status,
        ...(hasVariant
          ? {
              variants: {
                create: {
                  color: variant.color ?? null,
                  size: variant.size ?? null,
                  sku: variant.sku ?? null,
                  price: variant.price ?? null,
                },
              },
            }
          : {}),
      },
    });

    revalidatePath("/app/products");
    return { success: true, productId: product.id };
  } catch {
    return { success: false, error: "Erro ao salvar produto. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// deleteProduct — soft delete (ARCHIVED)
// ─────────────────────────────────────────

export async function deleteProduct(id: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  let workspaceId: string;
  try {
    const { workspace } = await requireWorkspace();
    workspaceId = workspace.id;
  } catch {
    return { success: false, error: "Não autorizado" };
  }

  try {
    const updated = await prisma.product.updateMany({
      where: { id, workspaceId },
      data: { status: "ARCHIVED" },
    });

    if (updated.count === 0) {
      return { success: false, error: "Produto não encontrado" };
    }

    revalidatePath("/app/products");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao arquivar produto. Tente novamente." };
  }
}
