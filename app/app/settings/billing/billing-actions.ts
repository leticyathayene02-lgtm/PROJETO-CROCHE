"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireWorkspace } from "@/lib/workspace";
import { startSubscription, cancelSubscription } from "@/lib/subscription-service";
import { prisma } from "@/lib/prisma";

export async function subscribeAction(formData: FormData) {
  const { workspace: ws, user } = await requireWorkspace();

  // Save CPF/CNPJ if provided
  const cpfCnpj = (formData.get("cpfCnpj") as string)?.replace(/\D/g, "") || null;
  if (cpfCnpj) {
    await prisma.user.update({
      where: { id: user.id },
      data: { cpfCnpj },
    });
  }

  // Fetch latest user data (in case CPF was just saved)
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, cpfCnpj: true },
  });

  let paymentUrl: string;
  try {
    const result = await startSubscription(ws.id, {
      name: fullUser?.name ?? null,
      email: fullUser?.email ?? user.email,
      cpfCnpj: fullUser?.cpfCnpj,
    });
    paymentUrl = result.paymentUrl;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : "Erro ao criar assinatura.";
    redirect(`/app/settings/billing?error=${encodeURIComponent(msg)}`);
  }

  redirect(`/app/settings/billing/aguardando?url=${encodeURIComponent(paymentUrl)}`);
}

export async function cancelSubscriptionAction() {
  const { workspace: ws } = await requireWorkspace();

  try {
    await cancelSubscription(ws.id);
  } catch (err) {
    if (isRedirectError(err)) throw err;
  }
  redirect("/app/settings/billing?canceled=1");
}
