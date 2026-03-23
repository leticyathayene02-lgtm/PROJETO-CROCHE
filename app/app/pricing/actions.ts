"use server";

import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import {
  checkPricingCalculationLimit,
  incrementPricingCounter,
} from "@/lib/limits";
import { computePricingTotals, type PricingInputs } from "@/lib/pricing";
import { pricingSchema, type PricingFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import type { CatalogMaterial, WorkspaceOverheadResult } from "./types";

// ─── Buscar materiais cadastrados do workspace ──────────────────────

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

// ─── Buscar custos fixos (overhead) do workspace ────────────────────

export async function getWorkspaceOverheadCosts(): Promise<WorkspaceOverheadResult> {
  const { workspace } = await requireWorkspace();
  const costs = await prisma.overheadCost.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true, amount: true },
    orderBy: { createdAt: "asc" },
  });
  const total = costs.reduce((sum, c) => sum + c.amount, 0);
  return { costs, total };
}

// ─── Buscar valor da hora padrão do workspace ───────────────────────

export async function getDefaultHourlyRate(): Promise<number> {
  try {
    const { workspace } = await requireWorkspace();
    return workspace.defaultHourlyRate ?? 0;
  } catch {
    return 0;
  }
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
    overheadPerPiece: data.overheadPerPiece,
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

// ─── Excluir cálculo de precificação ──────────────────────────────

export async function deletePricingCalculation(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const { workspace } = await requireWorkspace();

  const calc = await prisma.priceCalculation.findUnique({
    where: { id },
    select: { workspaceId: true },
  });

  if (!calc) {
    return { success: false, error: "Cálculo não encontrado" };
  }

  if (calc.workspaceId !== workspace.id) {
    return { success: false, error: "Sem permissão para excluir este cálculo" };
  }

  await prisma.priceCalculation.delete({ where: { id } });

  revalidatePath("/app/pricing");
  return { success: true };
}
