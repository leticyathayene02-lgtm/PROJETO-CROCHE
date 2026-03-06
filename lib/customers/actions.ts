"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";
import { customerSchema } from "./validators";

async function assertOwnership(customerId: string, workspaceId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, workspaceId },
    select: { id: true },
  });
  if (!customer) throw new Error("Cliente não encontrado ou sem permissão.");
  return customer;
}

export async function createCustomer(formData: FormData) {
  const { workspace } = await requireWorkspace();

  const raw = {
    name: formData.get("name") as string,
    instagram: (formData.get("instagram") as string) || undefined,
    whatsapp: (formData.get("whatsapp") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await prisma.customer.create({
    data: { ...parsed.data, workspaceId: workspace.id },
  });

  revalidatePath("/app/customers");
  redirect("/app/customers");
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const { workspace } = await requireWorkspace();
  await assertOwnership(customerId, workspace.id);

  const raw = {
    name: formData.get("name") as string,
    instagram: (formData.get("instagram") as string) || undefined,
    whatsapp: (formData.get("whatsapp") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: parsed.data,
  });

  revalidatePath("/app/customers");
  revalidatePath(`/app/customers/${customerId}`);
  redirect("/app/customers");
}

export async function deleteCustomer(customerId: string) {
  const { workspace } = await requireWorkspace();
  await assertOwnership(customerId, workspace.id);

  await prisma.customer.delete({ where: { id: customerId } });

  revalidatePath("/app/customers");
  redirect("/app/customers");
}
