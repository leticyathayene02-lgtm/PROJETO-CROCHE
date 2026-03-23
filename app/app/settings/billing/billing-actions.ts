"use server";

import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/workspace";
import { startSubscription } from "@/lib/subscription-service";

export async function subscribeAction() {
  let paymentUrl: string;

  try {
    const { workspace: ws, user } = await requireWorkspace();
    const result = await startSubscription(ws.id, {
      name: user.name,
      email: user.email,
    });
    paymentUrl = result.paymentUrl;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao criar assinatura.";
    // Encode the error message and redirect back with it
    redirect(`/app/settings/billing?error=${encodeURIComponent(msg)}`);
  }

  const encodedUrl = encodeURIComponent(paymentUrl);
  redirect(`/app/settings/billing/aguardando?url=${encodedUrl}`);
}

export async function cancelSubscriptionAction() {
  try {
    const { workspace: ws } = await requireWorkspace();
    const { cancelSubscription } = await import("@/lib/subscription-service");
    await cancelSubscription(ws.id);
  } catch {
    // ignore — still redirect
  }
  redirect("/app/settings/billing?canceled=1");
}
