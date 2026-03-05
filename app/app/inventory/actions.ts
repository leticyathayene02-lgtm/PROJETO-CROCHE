"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

// ─────────────────────────────────────────
// Zod schema (Zod v4 compatible)
// ─────────────────────────────────────────

export const yarnSchema = z.object({
  brand: z.string().min(1, "Marca é obrigatória"),
  line: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  gramsAvailable: z.number().min(0, "Quantidade não pode ser negativa"),
  costTotal: z.number().min(0, "Custo não pode ser negativo"),
  lowStockThreshold: z.number().min(0, "Limite não pode ser negativo"),
});

export type YarnFormData = z.infer<typeof yarnSchema>;

// ─────────────────────────────────────────
// createYarn
// ─────────────────────────────────────────

export async function createYarn(data: YarnFormData): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const parsed = yarnSchema.safeParse(data);

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
    await prisma.yarn.create({
      data: {
        workspaceId,
        brand: parsed.data.brand,
        line: parsed.data.line ?? null,
        color: parsed.data.color,
        gramsAvailable: parsed.data.gramsAvailable,
        costTotal: parsed.data.costTotal,
        lowStockThreshold: parsed.data.lowStockThreshold,
      },
    });

    revalidatePath("/app/inventory");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar fio. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// deleteYarn
// ─────────────────────────────────────────

export async function deleteYarn(id: string): Promise<
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
    await prisma.yarn.deleteMany({
      where: { id, workspaceId },
    });

    revalidatePath("/app/inventory");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir fio. Tente novamente." };
  }
}
