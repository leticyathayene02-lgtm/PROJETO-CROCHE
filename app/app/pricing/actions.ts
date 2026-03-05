"use server";

import { z } from "zod";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import {
  checkPricingCalculationLimit,
  incrementPricingCounter,
} from "@/lib/limits";
import { computePricingTotals } from "@/lib/pricing";

// ─────────────────────────────────────────
// Zod schema
// ─────────────────────────────────────────

export const pricingSchema = z.object({
  name: z.string().optional(),
  yarnCostPerGram: z.number().min(0, "Deve ser ≥ 0"),
  yarnGramsUsed: z.number().min(0, "Deve ser ≥ 0"),
  packaging: z.number().min(0, "Deve ser ≥ 0"),
  gift: z.number().min(0, "Deve ser ≥ 0"),
  labels: z.number().min(0, "Deve ser ≥ 0"),
  hoursSpent: z.number().min(0, "Deve ser ≥ 0"),
  hourlyRate: z.number().min(0, "Deve ser ≥ 0"),
  cardFeePercent: z.number().min(0, "Deve ser ≥ 0").max(100, "Deve ser ≤ 100"),
  profitMarginPercent: z.number().min(0, "Deve ser ≥ 0").max(100000, "Margem muito alta"),
});

export type PricingFormValues = z.infer<typeof pricingSchema>;

// ─────────────────────────────────────────
// Server action
// ─────────────────────────────────────────

export type CreatePricingResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function createPricingCalculation(
  raw: PricingFormValues
): Promise<CreatePricingResult> {
  // 1. Validate input
  const parsed = pricingSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return { success: false, error: firstError };
  }

  const data = parsed.data;

  // 2. Require authenticated workspace
  const { workspace } = await requireWorkspace();

  // 3. Check plan limit
  const limitCheck = await checkPricingCalculationLimit(workspace.id);
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason };
  }

  // 4. Compute totals
  const totals = computePricingTotals(data);

  const inputsJson = {
    yarnCostPerGram: data.yarnCostPerGram,
    yarnGramsUsed: data.yarnGramsUsed,
    packaging: data.packaging,
    gift: data.gift,
    labels: data.labels,
    hoursSpent: data.hoursSpent,
    hourlyRate: data.hourlyRate,
    cardFeePercent: data.cardFeePercent,
    profitMarginPercent: data.profitMarginPercent,
  };

  const totalsJson = {
    yarnCost: totals.yarnCost,
    materialsCost: totals.materialsCost,
    laborCost: totals.laborCost,
    subtotal: totals.subtotal,
    fees: totals.fees,
    profit: totals.profit,
    suggestedPrice: totals.suggestedPrice,
  };

  // 5. Persist to database
  const record = await prisma.priceCalculation.create({
    data: {
      workspaceId: workspace.id,
      name: data.name?.trim() || null,
      inputsJson,
      totalsJson,
    },
    select: { id: true },
  });

  // 6. Increment usage counter
  await incrementPricingCounter(workspace.id);

  return { success: true, data: { id: record.id } };
}
