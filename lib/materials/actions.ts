"use server";

import { z } from "zod";
import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const materialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.enum([
    "YARN", "FILLING", "EYES", "LABEL", "BUTTON",
    "ZIPPER", "RING", "PACKAGING", "TAG", "GIFT", "OTHER",
  ]),
  brand: z.string().optional(),
  color: z.string().optional(),
  unit: z.enum(["GRAMS", "METERS", "UNITS", "PACKS"]),
  costPerUnit: z.number().min(0, "Custo deve ser positivo"),
  stock: z.number().min(0).optional(),
  lowStockMin: z.number().min(0).optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
  // Campos específicos para fio/lã
  weightPerRoll: z.number().min(0).optional(),
  pricePerRoll: z.number().min(0).optional(),
  rolls: z.number().int().min(0).optional(),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;

type ActionResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function createMaterial(raw: MaterialFormValues): Promise<ActionResult> {
  const parsed = materialSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { workspace } = await requireWorkspace();
  const data = parsed.data;
  const isYarn = data.category === "YARN";

  const record = await prisma.material.create({
    data: {
      workspaceId: workspace.id,
      name: data.name.trim(),
      category: data.category,
      brand: data.brand?.trim() || null,
      color: data.color?.trim() || null,
      unit: data.unit,
      costPerUnit: data.costPerUnit,
      stock: data.stock ?? 0,
      lowStockMin: data.lowStockMin ?? 0,
      supplier: data.supplier?.trim() || null,
      notes: data.notes?.trim() || null,
      weightPerRoll: isYarn ? (data.weightPerRoll ?? null) : null,
      pricePerRoll: isYarn ? (data.pricePerRoll ?? null) : null,
      rolls: isYarn ? (data.rolls ?? null) : null,
    },
    select: { id: true },
  });

  revalidatePath("/app/materials");
  return { success: true, data: { id: record.id } };
}

export async function updateMaterial(id: string, raw: MaterialFormValues): Promise<ActionResult> {
  const parsed = materialSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { workspace } = await requireWorkspace();
  const data = parsed.data;
  const isYarn = data.category === "YARN";

  const existing = await prisma.material.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return { success: false, error: "Material não encontrado" };
  }

  await prisma.material.update({
    where: { id },
    data: {
      name: data.name.trim(),
      category: data.category,
      brand: data.brand?.trim() || null,
      color: data.color?.trim() || null,
      unit: data.unit,
      costPerUnit: data.costPerUnit,
      stock: data.stock ?? 0,
      lowStockMin: data.lowStockMin ?? 0,
      supplier: data.supplier?.trim() || null,
      notes: data.notes?.trim() || null,
      weightPerRoll: isYarn ? (data.weightPerRoll ?? null) : null,
      pricePerRoll: isYarn ? (data.pricePerRoll ?? null) : null,
      rolls: isYarn ? (data.rolls ?? null) : null,
    },
  });

  revalidatePath("/app/materials");
  return { success: true, data: { id } };
}

export async function deleteMaterial(id: string): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();

  const existing = await prisma.material.findFirst({
    where: { id, workspaceId: workspace.id },
  });
  if (!existing) {
    return { success: false, error: "Material não encontrado" };
  }

  await prisma.material.delete({ where: { id } });
  revalidatePath("/app/materials");
  return { success: true, data: { id } };
}
