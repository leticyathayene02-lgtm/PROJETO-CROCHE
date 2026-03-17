"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { checkTransactionLimit, incrementTransactionCounter } from "@/lib/limits";

// ─────────────────────────────────────────
// Zod Schema
// ─────────────────────────────────────────

const transactionSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

// ─────────────────────────────────────────
// Create Transaction
// ─────────────────────────────────────────

export async function createTransaction(
  values: TransactionFormValues
): Promise<{ success: boolean; error?: string }> {
  // Validate input
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return { success: false, error: message };
  }

  let workspace: Awaited<ReturnType<typeof requireWorkspace>>["workspace"];
  try {
    const session = await requireWorkspace();
    workspace = session.workspace;
  } catch {
    return { success: false, error: "Não autenticado" };
  }

  // Check plan limit
  const limitCheck = await checkTransactionLimit(workspace.id);
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason };
  }

  const { type, category, amount, date, notes } = parsed.data;

  try {
    await prisma.transaction.create({
      data: {
        workspaceId: workspace.id,
        type,
        category: category.trim(),
        amount,
        date: new Date(date),
        notes: notes?.trim() || null,
      },
    });

    await incrementTransactionCounter(workspace.id);
    revalidatePath("/app/finance");

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar transação. Tente novamente." };
  }
}

// ─────────────────────────────────────────
// Delete Transaction
// ─────────────────────────────────────────

export async function deleteTransaction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  let workspace: Awaited<ReturnType<typeof requireWorkspace>>["workspace"];
  try {
    const session = await requireWorkspace();
    workspace = session.workspace;
  } catch {
    return { success: false, error: "Não autenticado" };
  }

  try {
    await prisma.transaction.deleteMany({
      where: { id, workspaceId: workspace.id },
    });

    revalidatePath("/app/finance");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir transação." };
  }
}
