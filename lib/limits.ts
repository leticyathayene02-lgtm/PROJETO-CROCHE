import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

// ─────────────────────────────────────────
// Plan limits definition
// ─────────────────────────────────────────
export const PLAN_LIMITS = {
  FREE: {
    pricingCalculations: 3, // per month
    transactions: 5,        // per month
    products: 3,            // total (not per month — checked against DB count)
  },
  PREMIUM: {
    pricingCalculations: Infinity,
    transactions: Infinity,
    products: Infinity,
  },
} as const;

// ─────────────────────────────────────────
// Get current month key
// ─────────────────────────────────────────
export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─────────────────────────────────────────
// Get or create usage counter for this workspace/month
// ─────────────────────────────────────────
async function getOrCreateUsageCounter(workspaceId: string, monthYYYYMM: string) {
  return prisma.usageCounter.upsert({
    where: { workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM } },
    create: { workspaceId, monthYYYYMM },
    update: {},
  });
}

// ─────────────────────────────────────────
// Get workspace plan
// ─────────────────────────────────────────
async function getWorkspacePlan(workspaceId: string): Promise<Plan> {
  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId },
    select: { plan: true, status: true },
  });

  if (!subscription) return "FREE";

  // Only ACTIVE or TRIALING subscriptions grant premium access
  if (
    subscription.plan === "PREMIUM" &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING")
  ) {
    return "PREMIUM";
  }

  return "FREE";
}

// ─────────────────────────────────────────
// Check limits before creating resources
// ─────────────────────────────────────────
export type LimitCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; limit: number; current: number };

export async function checkPricingCalculationLimit(
  workspaceId: string
): Promise<LimitCheckResult> {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = PLAN_LIMITS[plan].pricingCalculations;
  if (limit === Infinity) return { allowed: true };

  const monthKey = getCurrentMonthKey();
  const counter = await getOrCreateUsageCounter(workspaceId, monthKey);

  if (counter.pricingCalculationsCount >= limit) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${limit} cálculos por mês no plano gratuito. Faça upgrade para continuar.`,
      limit,
      current: counter.pricingCalculationsCount,
    };
  }
  return { allowed: true };
}

export async function checkTransactionLimit(
  workspaceId: string
): Promise<LimitCheckResult> {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = PLAN_LIMITS[plan].transactions;
  if (limit === Infinity) return { allowed: true };

  const monthKey = getCurrentMonthKey();
  const counter = await getOrCreateUsageCounter(workspaceId, monthKey);

  if (counter.transactionsCount >= limit) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${limit} transações por mês no plano gratuito. Faça upgrade para continuar.`,
      limit,
      current: counter.transactionsCount,
    };
  }
  return { allowed: true };
}

export async function checkProductLimit(
  workspaceId: string
): Promise<LimitCheckResult> {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = PLAN_LIMITS[plan].products;
  if (limit === Infinity) return { allowed: true };

  const count = await prisma.product.count({ where: { workspaceId } });

  if (count >= limit) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${limit} produtos no plano gratuito. Faça upgrade para continuar.`,
      limit,
      current: count,
    };
  }
  return { allowed: true };
}

// ─────────────────────────────────────────
// Increment counters after successful creation
// ─────────────────────────────────────────
export async function incrementPricingCounter(workspaceId: string) {
  const monthKey = getCurrentMonthKey();
  await prisma.usageCounter.upsert({
    where: { workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM: monthKey } },
    create: { workspaceId, monthYYYYMM: monthKey, pricingCalculationsCount: 1 },
    update: { pricingCalculationsCount: { increment: 1 } },
  });
}

export async function incrementTransactionCounter(workspaceId: string) {
  const monthKey = getCurrentMonthKey();
  await prisma.usageCounter.upsert({
    where: { workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM: monthKey } },
    create: { workspaceId, monthYYYYMM: monthKey, transactionsCount: 1 },
    update: { transactionsCount: { increment: 1 } },
  });
}
