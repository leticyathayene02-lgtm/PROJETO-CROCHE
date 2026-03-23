"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

export async function saveTimeEntry({
  orderId,
  productId,
  stage,
  minutes,
}: {
  orderId?: string;
  productId?: string;
  stage: string;
  minutes: number;
}) {
  const { workspace } = await requireWorkspace();

  if (minutes <= 0) throw new Error("Tempo inválido.");

  // If orderId provided, verify ownership
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!order) throw new Error("Pedido não encontrado.");
  }

  await prisma.timeEntry.create({
    data: {
      workspaceId: workspace.id,
      orderId: orderId ?? null,
      productId: productId ?? null,
      stage,
      minutes,
    },
  });

  if (orderId) revalidatePath(`/app/orders/${orderId}`);
}

export async function getAverageMinutes(itemDescription: string) {
  const { workspace } = await requireWorkspace();

  const entries = await prisma.timeEntry.findMany({
    where: {
      workspaceId: workspace.id,
      order: { itemDescription: { contains: itemDescription, mode: "insensitive" } },
    },
    select: { minutes: true },
  });

  if (entries.length === 0) return null;
  const avg = entries.reduce((s, e) => s + e.minutes, 0) / entries.length;
  return Math.round(avg);
}

export async function listTimeEntriesForOrder(orderId: string) {
  const { workspace } = await requireWorkspace();
  return prisma.timeEntry.findMany({
    where: { workspaceId: workspace.id, orderId },
    orderBy: { createdAt: "desc" },
  });
}

const STAGE_LABELS: Record<string, string> = {
  production: "Produção",
  finishing: "Acabamento",
  packaging: "Embalagem",
  other: "Outros",
};

export type StageBreakdown = {
  stage: string;
  label: string;
  minutes: number;
};

export type OrderTimeSummary = {
  totalMinutes: number;
  stages: StageBreakdown[];
};

export async function getOrderTimeSummary(
  orderId: string
): Promise<OrderTimeSummary> {
  const { workspace } = await requireWorkspace();

  const entries = await prisma.timeEntry.findMany({
    where: { workspaceId: workspace.id, orderId },
    select: { stage: true, minutes: true },
  });

  const byStage: Record<string, number> = {};
  let totalMinutes = 0;

  for (const e of entries) {
    byStage[e.stage] = (byStage[e.stage] ?? 0) + e.minutes;
    totalMinutes += e.minutes;
  }

  const stages: StageBreakdown[] = Object.entries(byStage)
    .map(([stage, minutes]) => ({
      stage,
      label: STAGE_LABELS[stage] ?? stage,
      minutes,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  return { totalMinutes, stages };
}
