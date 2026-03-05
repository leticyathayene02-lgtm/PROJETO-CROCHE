import Stripe from "stripe";

// TODO: Replace with real Stripe integration when going live
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
});

export const STRIPE_PRICE_ID_PREMIUM = process.env.STRIPE_PRICE_ID_PREMIUM ?? "";

export async function createCheckoutSession({
  workspaceId,
  userId,
  email,
  customerId,
}: {
  workspaceId: string;
  userId: string;
  email: string;
  customerId?: string | null;
}) {
  // TODO: Implement real Stripe checkout
  console.log("[Stripe stub] createCheckoutSession", { workspaceId, userId, email });

  const session = await stripe.checkout.sessions.create({
    customer: customerId ?? undefined,
    customer_email: customerId ? undefined : email,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: STRIPE_PRICE_ID_PREMIUM,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing?canceled=true`,
    metadata: {
      workspaceId,
      userId,
    },
  });

  return session;
}

export async function createBillingPortalSession(customerId: string) {
  // TODO: Implement real Stripe billing portal
  console.log("[Stripe stub] createBillingPortalSession", { customerId });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/billing`,
  });

  return session;
}
