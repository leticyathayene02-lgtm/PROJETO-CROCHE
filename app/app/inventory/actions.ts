"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";
import { stockItemSchema, type StockItemFormData } from "./schema";

// ─────────────────────────────────────────
// createStockItem
// ─────────────────────────────────────────

export async function createStockItem(data: StockItemFormData): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = stockItemSchema.safeParse(data);

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
    await prisma.stockItem.create({
      data: {
        workspaceId,
        name: parsed.data.name,
        color: parsed.data.color ?? null,
        size: parsed.data.size ?? null,
        quantity: parsed.data.quantity,
        price: parsed.data.price ?? null,
        cost: parsed.data.cost ?? null,
        notes: parsed.data.notes ?? null,
      },
    });

    revalidatePath("/app/inventory");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar item. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// updateStockItem
// ─────────────────────────────────────────

export async function updateStockItem(id: string, data: StockItemFormData): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = stockItemSchema.safeParse(data);

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
    await prisma.stockItem.updateMany({
      where: { id, workspaceId },
      data: {
        name: parsed.data.name,
        color: parsed.data.color ?? null,
        size: parsed.data.size ?? null,
        quantity: parsed.data.quantity,
        price: parsed.data.price ?? null,
        cost: parsed.data.cost ?? null,
        notes: parsed.data.notes ?? null,
      },
    });

    revalidatePath("/app/inventory");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar item. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// deleteStockItem
// ─────────────────────────────────────────

export async function deleteStockItem(id: string): Promise<
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
    await prisma.stockItem.deleteMany({
      where: { id, workspaceId },
    });

    revalidatePath("/app/inventory");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir item. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// getStockItemById
// ─────────────────────────────────────────

export async function getStockItemById(id: string) {
  const { workspace } = await requireWorkspace();

  return prisma.stockItem.findFirst({
    where: { id, workspaceId: workspace.id },
  });
}
