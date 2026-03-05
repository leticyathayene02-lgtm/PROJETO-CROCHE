import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

// Webhook must be raw body — disable body parsing
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[Stripe Webhook] Event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;

        if (!workspaceId) break;

        await prisma.subscription.upsert({
          where: { workspaceId },
          create: {
            workspaceId,
            plan: "PREMIUM",
            status: "ACTIVE",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
          update: {
            plan: "PREMIUM",
            status: "ACTIVE",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });

        console.log("[Stripe Webhook] Subscription activated for:", workspaceId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceRecord = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!workspaceRecord) break;

        const status =
          subscription.status === "active"
            ? "ACTIVE"
            : subscription.status === "trialing"
              ? "TRIALING"
              : subscription.status === "past_due"
                ? "PAST_DUE"
                : "CANCELED";

        await prisma.subscription.update({
          where: { workspaceId: workspaceRecord.workspaceId },
          data: {
            status,
            currentPeriodEnd: new Date(
              (subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000
            ),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const workspaceRecord = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!workspaceRecord) break;

        await prisma.subscription.update({
          where: { workspaceId: workspaceRecord.workspaceId },
          data: { plan: "FREE", status: "CANCELED" },
        });

        console.log(
          "[Stripe Webhook] Subscription canceled for:",
          workspaceRecord.workspaceId
        );
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
