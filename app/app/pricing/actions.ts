"use server";

import { z } from "zod";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import {
  checkPricingCalculationLimit,
  incrementPricingCounter,
} from "@/lib/limits";
import { computePricingTotals, type PricingInputs } from "@/lib/pricing";

// ─────────────────────────────────────────
// Zod schema (accepts both old and new format)
// ─────────────────────────────────────────

const materialItemSchema = z.object({
  name: z.string(),
  unit: z.string(),
  quantity: z.number().min(0),
  costPerUnit: z.number().min(0),
});

const laborStageSchema = z.object({
  name: z.string(),
  minutes: z.number().min(0),
});

const overheadItemSchema = z.object({
  name: z.string(),
  monthlyAmount: z.number().min(0),
});

const scenarioSchema = z.object({
  name: z.string(),
  feePercent: z.number().min(0).max(100),
});

export const pricingSchema = z.object({
  name: z.string().optional(),

  // New format
  materials: z.array(materialItemSchema).optional(),
  laborStages: z.array(laborStageSchema).optional(),
  hourlyRate: z.number().min(0).optional(),
  overheadItems: z.array(overheadItemSchema).optional(),
  monthlyHoursWorked: z.number().min(0).optional(),
  profitMarginPercent: z.number().min(0).max(100000),
  taxPercent: z.number().min(0).max(100).optional(),
  scenarios: z.array(scenarioSchema).optional(),

  // Legacy fields (still accepted)
  yarnCostPerGram: z.number().min(0).optional(),
  yarnGramsUsed: z.number().min(0).optional(),
  packaging: z.number().min(0).optional(),
  gift: z.number().min(0).optional(),
  labels: z.number().min(0).optional(),
  hoursSpent: z.number().min(0).optional(),
  cardFeePercent: z.number().min(0).max(100).optional(),
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
  const parsed = pricingSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return { success: false, error: firstError };
  }

  const data = parsed.data;
  const { workspace } = await requireWorkspace();

  const limitCheck = await checkPricingCalculationLimit(workspace.id);
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason };
  }

  const inputs: PricingInputs = {
    materials: data.materials ?? [],
    laborStages: data.laborStages ?? [],
    hourlyRate: data.hourlyRate ?? 0,
    overheadItems: data.overheadItems ?? [],
    monthlyHoursWorked: data.monthlyHoursWorked ?? 160,
    profitMarginPercent: data.profitMarginPercent ?? 0,
    taxPercent: data.taxPercent ?? 0,
    scenarios: data.scenarios ?? [],
    // Legacy
    yarnCostPerGram: data.yarnCostPerGram,
    yarnGramsUsed: data.yarnGramsUsed,
    packaging: data.packaging,
    gift: data.gift,
    labels: data.labels,
    hoursSpent: data.hoursSpent,
    cardFeePercent: data.cardFeePercent,
  };

  const totals = computePricingTotals(inputs);

  const record = await prisma.priceCalculation.create({
    data: {
      workspaceId: workspace.id,
      name: data.name?.trim() || null,
      inputsJson: JSON.parse(JSON.stringify(inputs)),
      totalsJson: JSON.parse(JSON.stringify(totals)),
    },
    select: { id: true },
  });

  await incrementPricingCounter(workspace.id);

  return { success: true, data: { id: record.id } };
}
