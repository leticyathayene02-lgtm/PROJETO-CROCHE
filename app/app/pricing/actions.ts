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
// Zod schema
// ─────────────────────────────────────────

export const pricingSchema = z.object({
  name: z.string().optional(),

  // Materiais
  material: z.number().min(0),
  embalagem: z.number().min(0),
  etiqueta: z.number().min(0),
  mimo: z.number().min(0),

  // Tempo
  horas: z.number().min(0),
  valorHora: z.number().min(0),

  // Taxas
  taxaCartao: z.number().min(0).max(99),
  impostoMarketplace: z.number().min(0).max(99),

  // Lucro
  profitMode: z.enum(["percent", "fixed"]),
  margemPercent: z.number().min(0).max(500),
  lucroFixo: z.number().min(0),
});

export type PricingFormValues = z.infer<typeof pricingSchema>;

// ─────────────────────────────────────────
// Server action: criar cálculo
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
    material: data.material,
    embalagem: data.embalagem,
    etiqueta: data.etiqueta,
    mimo: data.mimo,
    horas: data.horas,
    valorHora: data.valorHora,
    taxaCartao: data.taxaCartao,
    impostoMarketplace: data.impostoMarketplace,
    profitMode: data.profitMode,
    margemPercent: data.margemPercent,
    lucroFixo: data.lucroFixo,
    name: data.name,
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
