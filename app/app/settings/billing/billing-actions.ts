"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireWorkspace } from "@/lib/workspace";
import { startSubscription, cancelSubscription } from "@/lib/subscription-service";

export async function subscribeAction() {
  // Auth outside try/catch so redirect() from requireWorkspace isn't swallowed
  const { workspace: ws, user } = await requireWorkspace();

  let paymentUrl: string;
  try {
    const result = await startSubscription(ws.id, {
      name: user.name,
      email: user.email,
    });
    paymentUrl = result.paymentUrl;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : "Erro ao criar assinatura.";
    redirect(`/app/settings/billing?error=${encodeURIComponent(msg)}`);
  }

  const encodedUrl = encodeURIComponent(paymentUrl);
  redirect(`/app/settings/billing/aguardando?url=${encodedUrl}`);
}

export async function cancelSubscriptionAction() {
  const { workspace: ws } = await requireWorkspace();

  try {
    await cancelSubscription(ws.id);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    // ignore other errors — still redirect
  }
  redirect("/app/settings/billing?canceled=1");
}
