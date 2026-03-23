"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";
import { checkProductLimit } from "@/lib/limits";
import {
  productSchema,
  updateProductSchema,
  type ProductFormData,
  type UpdateProductFormData,
} from "./schema";

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
// updateProduct
// ─────────────────────────────────────────

export async function updateProduct(
  productId: string,
  data: UpdateProductFormData
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = updateProductSchema.safeParse(data);
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

  try {
    // Verify ownership
    const existing = await prisma.product.findFirst({
      where: { id: productId, workspaceId },
      include: { variants: true },
    });

    if (!existing) {
      return { success: false, error: "Produto não encontrado" };
    }

    const { name, description, status, variants } = parsed.data;

    // Determine which variants to keep, update, create, or delete
    const incomingIds = variants
      .map((v) => v.id)
      .filter((id): id is string => !!id);
    const existingIds = existing.variants.map((v) => v.id);
    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));

    await prisma.$transaction(async (tx) => {
      // Update product fields
      await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description: description ?? null,
          status,
        },
      });

      // Delete removed variants
      if (idsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: idsToDelete }, productId },
        });
      }

      // Update existing variants and create new ones
      for (const v of variants) {
        const variantData = {
          color: v.color ?? null,
          size: v.size ?? null,
          sku: v.sku ?? null,
          price: v.price ?? null,
        };

        if (v.id && existingIds.includes(v.id)) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: variantData,
          });
        } else {
          await tx.productVariant.create({
            data: { productId, ...variantData },
          });
        }
      }
    });

    revalidatePath("/app/products");
    revalidatePath(`/app/products/${productId}/edit`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar produto. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// archiveProduct — soft delete (ARCHIVED)
// ─────────────────────────────────────────

export async function archiveProduct(id: string): Promise<
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

// ─────────────────────────────────────────
// deleteProduct — hard delete (permanent)
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
    // Verify ownership before deleting
    const product = await prisma.product.findFirst({
      where: { id, workspaceId },
    });

    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }

    // Cascade delete handles variants automatically
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/app/products");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir produto. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// getProduct — fetch single product for editing
// ─────────────────────────────────────────

export async function getProduct(productId: string) {
  let workspaceId: string;
  try {
    const { workspace } = await requireWorkspace();
    workspaceId = workspace.id;
  } catch {
    return null;
  }

  return prisma.product.findFirst({
    where: { id: productId, workspaceId },
    include: { variants: { orderBy: { createdAt: "asc" } } },
  });
}
