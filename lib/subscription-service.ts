import "server-only";
import { prisma } from "@/lib/prisma";
import {
  createCustomer,
  findCustomerByEmail,
  createSubscription,
  cancelAsaasSubscription,
  getSubscriptionPayments,
  type AsaasWebhookEvent,
} from "@/lib/asaas";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const SUBSCRIPTION_VALUE = 19.9; // R$ 19,90/mês
const BILLING_TYPE = "BOLETO"; // Aceita PIX, BOLETO, CREDIT_CARD — BOLETO também aceita PIX no Asaas
const CYCLE = "MONTHLY";
const DESCRIPTION = "Trama Pro — Plano Premium";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getNextDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1); // amanhã
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// ─────────────────────────────────────────
// Start subscription
// ─────────────────────────────────────────

/**
 * Cria ou reutiliza customer no Asaas, cria subscription,
 * atualiza o banco e retorna o link de pagamento do primeiro boleto.
 */
export async function startSubscription(
  workspaceId: string,
  user: { name: string | null; email: string }
): Promise<{ paymentUrl: string; subscriptionId: string }> {
  console.log(`[SubscriptionService] Starting subscription for workspace: ${workspaceId}`);

  // 1. Check if already has active Asaas subscription in DB
  const existing = await prisma.subscription.findUnique({
    where: { workspaceId },
  });

  if (
    existing?.asaasSubscriptionId &&
    (existing.status === "ACTIVE" || existing.status === "TRIALING")
  ) {
    throw new Error("Este workspace já possui uma assinatura ativa.");
  }

  // 2. Find or create Asaas customer
  let asaasCustomerId = existing?.asaasCustomerId ?? null;

  if (!asaasCustomerId) {
    const existingCustomer = await findCustomerByEmail(user.email);
    if (existingCustomer) {
      asaasCustomerId = existingCustomer.id;
    } else {
      const newCustomer = await createCustomer({
        name: user.name ?? user.email,
        email: user.email,
      });
      asaasCustomerId = newCustomer.id;
    }
  }

  // 3. Create Asaas subscription
  const nextDueDate = getNextDueDate();
  const asaasSub = await createSubscription({
    customer: asaasCustomerId,
    billingType: BILLING_TYPE,
    value: SUBSCRIPTION_VALUE,
    nextDueDate,
    cycle: CYCLE,
    description: DESCRIPTION,
  });

  // 4. Persist to DB
  await prisma.subscription.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      plan: "FREE", // plan upgrades to PREMIUM when payment is confirmed via webhook
      status: "TRIALING",
      asaasCustomerId,
      asaasSubscriptionId: asaasSub.id,
    },
    update: {
      asaasCustomerId,
      asaasSubscriptionId: asaasSub.id,
      status: "TRIALING",
    },
  });

  console.log(`[SubscriptionService] Subscription created: ${asaasSub.id}, fetching payment link`);

  // 5. Get the first payment link (boleto/pix invoice)
  const payments = await getSubscriptionPayments(asaasSub.id);
  const firstPayment = payments[0];
  const paymentUrl =
    firstPayment?.invoiceUrl ?? firstPayment?.bankSlipUrl ?? null;

  if (!paymentUrl) {
    // If no payment link yet, return the Asaas subscription ID so client can poll
    console.warn(`[SubscriptionService] No payment URL found for subscription ${asaasSub.id}`);
    // Fallback: return a URL to the Asaas sandbox/production customer area
    return {
      paymentUrl: `https://sandbox.asaas.com/i/${asaasSub.id}`,
      subscriptionId: asaasSub.id,
    };
  }

  return { paymentUrl, subscriptionId: asaasSub.id };
}

// ─────────────────────────────────────────
// Cancel subscription
// ─────────────────────────────────────────

export async function cancelSubscription(workspaceId: string): Promise<void> {
  console.log(`[SubscriptionService] Canceling subscription for workspace: ${workspaceId}`);

  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId },
  });

  if (!subscription) {
    throw new Error("Assinatura não encontrada.");
  }

  if (subscription.asaasSubscriptionId) {
    try {
      await cancelAsaasSubscription(subscription.asaasSubscriptionId);
    } catch (err) {
      console.error("[SubscriptionService] Failed to cancel on Asaas:", err);
      // Still update DB even if Asaas call failed
    }
  }

  await prisma.subscription.update({
    where: { workspaceId },
    data: {
      plan: "FREE",
      status: "CANCELED",
    },
  });

  console.log(`[SubscriptionService] Subscription canceled for workspace: ${workspaceId}`);
}

// ─────────────────────────────────────────
// Process webhook event (idempotent)
// ─────────────────────────────────────────

export async function processWebhookEvent(event: AsaasWebhookEvent): Promise<void> {
  const { event: eventType, payment } = event;

  console.log(`[SubscriptionService] Processing event: ${eventType}, payment: ${payment.id}`);

  // Idempotency check — skip if we already processed this payment ID
  if (payment.id) {
    const already = await prisma.subscription.findFirst({
      where: { lastAsaasPaymentId: payment.id },
    });
    if (already) {
      console.log(`[SubscriptionService] Event already processed (paymentId: ${payment.id}), skipping.`);
      return;
    }
  }

  // Find subscription by asaasSubscriptionId
  const subscriptionId = payment.subscription;
  if (!subscriptionId) {
    console.warn(`[SubscriptionService] Event ${eventType} has no subscription reference. Ignoring.`);
    return;
  }

  const record = await prisma.subscription.findFirst({
    where: { asaasSubscriptionId: subscriptionId },
  });

  if (!record) {
    console.warn(`[SubscriptionService] No subscription found for asaasSubscriptionId: ${subscriptionId}`);
    return;
  }

  switch (eventType) {
    case "PAYMENT_RECEIVED":
    case "PAYMENT_CONFIRMED": {
      const now = new Date();
      const periodEnd = addDays(30);

      await prisma.subscription.update({
        where: { workspaceId: record.workspaceId },
        data: {
          plan: "PREMIUM",
          status: "ACTIVE",
          lastPaymentAt: now,
          lastAsaasPaymentId: payment.id,
          currentPeriodEnd: periodEnd,
        },
      });

      console.log(
        `[SubscriptionService] Payment confirmed — workspace ${record.workspaceId} upgraded to PREMIUM. Period ends: ${periodEnd.toISOString()}`
      );
      break;
    }

    case "PAYMENT_OVERDUE": {
      await prisma.subscription.update({
        where: { workspaceId: record.workspaceId },
        data: {
          status: "PAST_DUE",
          lastAsaasPaymentId: payment.id,
        },
      });

      console.log(`[SubscriptionService] Payment overdue — workspace ${record.workspaceId} set to PAST_DUE`);
      break;
    }

    case "SUBSCRIPTION_DELETED":
    case "PAYMENT_DELETED": {
      await prisma.subscription.update({
        where: { workspaceId: record.workspaceId },
        data: {
          plan: "FREE",
          status: "CANCELED",
          lastAsaasPaymentId: payment.id,
        },
      });

      console.log(`[SubscriptionService] Subscription deleted — workspace ${record.workspaceId} set to FREE/CANCELED`);
      break;
    }

    default:
      console.log(`[SubscriptionService] Unhandled event type: ${eventType}`);
  }
}
