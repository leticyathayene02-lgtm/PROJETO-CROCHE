"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";
import { orderSchema, type ChecklistItem } from "./validators";

// ── Auto-create transaction when payment status advances ─────────────────────

async function maybeCreatePaymentTransaction(
  workspaceId: string,
  orderId: string,
  oldStatus: string,
  newStatus: string,
  orderAmount: number,
  customerName: string
) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (newStatus === "PAID" && oldStatus !== "PAID") {
    // Full or remaining payment
    const amount = oldStatus === "HALF_PAID" ? orderAmount * 0.5 : orderAmount;
    const category = oldStatus === "HALF_PAID" ? "Encomenda (saldo)" : "Encomenda";
    await prisma.transaction.create({
      data: {
        workspaceId,
        type: "IN",
        category,
        amount: Math.round(amount * 100) / 100,
        date: today,
        notes: customerName,
      },
    });
    revalidatePath("/app/finance");
  } else if (newStatus === "HALF_PAID" && oldStatus === "UNPAID") {
    await prisma.transaction.create({
      data: {
        workspaceId,
        type: "IN",
        category: "Encomenda (50%)",
        amount: Math.round(orderAmount * 0.5 * 100) / 100,
        date: today,
        notes: customerName,
      },
    });
    revalidatePath("/app/finance");
  }
}

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
    customerId: (formData.get("customerId") as string) || undefined,
    itemDescription: formData.get("itemDescription") as string,
    dueDate: formData.get("dueDate") as string,
    amount: parseFloat(formData.get("amount") as string),
    paymentStatus: formData.get("paymentStatus") as string,
    productionStatus: (formData.get("productionStatus") as string) || undefined,
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
  const currentOrder = await prisma.order.findFirst({
    where: { id: orderId, workspaceId: workspace.id },
    select: { id: true, paymentStatus: true, amount: true, customerName: true },
  });
  if (!currentOrder) throw new Error("Pedido não encontrado.");

  const raw = {
    orderDate: formData.get("orderDate") as string,
    customerName: formData.get("customerName") as string,
    customerId: (formData.get("customerId") as string) || undefined,
    itemDescription: formData.get("itemDescription") as string,
    dueDate: formData.get("dueDate") as string,
    amount: parseFloat(formData.get("amount") as string),
    paymentStatus: formData.get("paymentStatus") as string,
    productionStatus: (formData.get("productionStatus") as string) || undefined,
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

  await maybeCreatePaymentTransaction(
    workspace.id,
    orderId,
    currentOrder.paymentStatus,
    parsed.data.paymentStatus,
    parsed.data.amount,
    parsed.data.customerName
  );

  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
  redirect(`/app/orders/${orderId}`);
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

  const order = await prisma.order.findFirst({
    where: { id: orderId, workspaceId: workspace.id },
    select: { id: true, paymentStatus: true, amount: true, customerName: true },
  });
  if (!order) throw new Error("Pedido não encontrado.");

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: newStatus },
  });

  await maybeCreatePaymentTransaction(
    workspace.id,
    orderId,
    order.paymentStatus,
    newStatus,
    order.amount,
    order.customerName
  );

  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
}

export async function duplicateOrder(orderId: string) {
  const { workspace } = await requireWorkspace();

  const order = await prisma.order.findFirst({
    where: { id: orderId, workspaceId: workspace.id },
  });
  if (!order) throw new Error("Pedido não encontrado.");

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const newOrder = await prisma.order.create({
    data: {
      workspaceId: workspace.id,
      customerName: order.customerName,
      customerId: order.customerId,
      itemDescription: order.itemDescription,
      amount: order.amount,
      orderDate: today,
      dueDate: today,
      paymentStatus: "UNPAID",
      productionStatus: "TODO",
      notes: order.notes,
      channel: order.channel,
      checklistJson: order.checklistJson ?? undefined,
    },
  });

  revalidatePath("/app/orders");
  redirect(`/app/orders/${newOrder.id}`);
}

export async function updateProductionStatus(
  orderId: string,
  newStatus: "TODO" | "IN_PROGRESS" | "FINISHING" | "READY" | "DELIVERED"
) {
  const { workspace } = await requireWorkspace();
  await assertOrderOwnership(orderId, workspace.id);

  await prisma.order.update({
    where: { id: orderId },
    data: { productionStatus: newStatus },
  });

  revalidatePath("/app/orders");
  revalidatePath("/app/orders/board");
  revalidatePath(`/app/orders/${orderId}`);
}

export async function updateChecklist(orderId: string, items: ChecklistItem[]) {
  const { workspace } = await requireWorkspace();
  await assertOrderOwnership(orderId, workspace.id);

  await prisma.order.update({
    where: { id: orderId },
    data: { checklistJson: items },
  });

  revalidatePath(`/app/orders/${orderId}`);
}
