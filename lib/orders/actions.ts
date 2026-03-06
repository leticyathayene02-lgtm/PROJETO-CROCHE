"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";
import { orderSchema } from "./validators";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function assertOrderOwnership(orderId: string, workspaceId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, workspaceId },
    select: { id: true },
  });
  if (!order) throw new Error("Pedido não encontrado ou sem permissão.");
  return order;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  const { workspace } = await requireWorkspace();

  const raw = {
    orderDate: formData.get("orderDate") as string,
    customerName: formData.get("customerName") as string,
    itemDescription: formData.get("itemDescription") as string,
    dueDate: formData.get("dueDate") as string,
    amount: parseFloat(formData.get("amount") as string),
    paymentStatus: formData.get("paymentStatus") as string,
    notes: (formData.get("notes") as string) || undefined,
    channel: (formData.get("channel") as string) || undefined,
  };

  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    throw new Error(msg);
  }

  const { orderDate, dueDate, ...rest } = parsed.data;

  await prisma.order.create({
    data: {
      ...rest,
      orderDate: new Date(orderDate),
      dueDate: new Date(dueDate),
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/app/orders");
  redirect("/app/orders");
}

export async function updateOrder(orderId: string, formData: FormData) {
  const { workspace } = await requireWorkspace();
  await assertOrderOwnership(orderId, workspace.id);

  const raw = {
    orderDate: formData.get("orderDate") as string,
    customerName: formData.get("customerName") as string,
    itemDescription: formData.get("itemDescription") as string,
    dueDate: formData.get("dueDate") as string,
    amount: parseFloat(formData.get("amount") as string),
    paymentStatus: formData.get("paymentStatus") as string,
    notes: (formData.get("notes") as string) || undefined,
    channel: (formData.get("channel") as string) || undefined,
  };

  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    throw new Error(msg);
  }

  const { orderDate, dueDate, ...rest } = parsed.data;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      ...rest,
      orderDate: new Date(orderDate),
      dueDate: new Date(dueDate),
    },
  });

  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
  redirect("/app/orders");
}

export async function deleteOrder(orderId: string) {
  const { workspace } = await requireWorkspace();
  await assertOrderOwnership(orderId, workspace.id);

  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath("/app/orders");
  redirect("/app/orders");
}

export async function updatePaymentStatus(
  orderId: string,
  newStatus: "UNPAID" | "HALF_PAID" | "PAID"
) {
  const { workspace } = await requireWorkspace();
  await assertOrderOwnership(orderId, workspace.id);

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: newStatus },
  });

  revalidatePath("/app/orders");
}
