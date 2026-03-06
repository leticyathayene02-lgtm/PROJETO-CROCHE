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
