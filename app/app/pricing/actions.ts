"use server";

import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import {
  checkPricingCalculationLimit,
  incrementPricingCounter,
} from "@/lib/limits";
import { computePricingTotals, type PricingInputs } from "@/lib/pricing";
import { pricingSchema, type PricingFormValues } from "./schema";

// ─── Buscar materiais cadastrados do workspace ──────────────────────

export interface CatalogMaterial {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  color: string | null;
  unit: string;
  costPerUnit: number;
  stock: number;
}

export async function getWorkspaceMaterials(): Promise<CatalogMaterial[]> {
  const { workspace } = await requireWorkspace();
  const materials = await prisma.material.findMany({
    where: { workspaceId: workspace.id },
    select: {
      id: true,
      name: true,
      category: true,
      brand: true,
      color: true,
      unit: true,
      costPerUnit: true,
      stock: true,
    },
    orderBy: { name: "asc" },
  });
  return materials;
}

// ─── Criar cálculo de precificação ──────────────────────────────────

export async function createPricingCalculation(
  raw: PricingFormValues
): Promise<{ success: true; data: { id: string } } | { success: false; error: string }> {
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

  // Soma dos complementares do catálogo
  const complementaresTotal = (data.selectedMaterials ?? []).reduce(
    (sum, m) => sum + m.cost,
    0
  );

  const inputs: PricingInputs = {
    material: data.material,
    embalagem: 0,
    mimo: 0,
    acessorios: 0,
    grafica: 0,
    complementares: complementaresTotal,
    horas: data.horas,
    valorHora: data.valorHora,
    taxaCartao: data.taxaCartao,
    impostoMarketplace: data.impostoMarketplace,
    profitMode: data.profitMode,
    margemPercent: data.margemPercent,
    lucroFixo: data.lucroFixo,
    name: data.name,
    selectedMaterials: data.selectedMaterials,
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
