"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number({ message: "Informe um valor válido" }).positive("Valor deve ser positivo"),
});

export async function createOverheadCost(
  values: { name: string; amount: number }
): Promise<{ success: boolean; error?: string }> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  let workspace: Awaited<ReturnType<typeof requireWorkspace>>["workspace"];
  try {
    ({ workspace } = await requireWorkspace());
  } catch {
    return { success: false, error: "Não autenticado" };
  }

  await prisma.overheadCost.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name.trim(),
      amount: parsed.data.amount,
    },
  });

  revalidatePath("/app/overhead");
  return { success: true };
}

export async function updateOverheadCost(
  id: string,
  values: { name: string; amount: number }
): Promise<{ success: boolean; error?: string }> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  let workspace: Awaited<ReturnType<typeof requireWorkspace>>["workspace"];
  try {
    ({ workspace } = await requireWorkspace());
  } catch {
    return { success: false, error: "Não autenticado" };
  }

  await prisma.overheadCost.updateMany({
    where: { id, workspaceId: workspace.id },
    data: { name: parsed.data.name.trim(), amount: parsed.data.amount },
  });

  revalidatePath("/app/overhead");
  return { success: true };
}

export async function deleteOverheadCost(
  id: string
): Promise<{ success: boolean; error?: string }> {
  let workspace: Awaited<ReturnType<typeof requireWorkspace>>["workspace"];
  try {
    ({ workspace } = await requireWorkspace());
  } catch {
    return { success: false, error: "Não autenticado" };
  }

  await prisma.overheadCost.deleteMany({
    where: { id, workspaceId: workspace.id },
  });

  revalidatePath("/app/overhead");
  return { success: true };
}
