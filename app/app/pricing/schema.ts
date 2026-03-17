import { z } from "zod";

// Item de material complementar selecionado do catálogo
export const selectedMaterialSchema = z.object({
  materialId: z.string(),
  name: z.string(),
  unit: z.string(),
  costPerUnit: z.number(),
  quantity: z.number().min(0),
  cost: z.number().min(0),
});

export type SelectedMaterial = z.infer<typeof selectedMaterialSchema>;

export const pricingSchema = z.object({
  name: z.string().optional(),

  // Custo manual da linha/fio principal
  material: z.number().min(0),

  // Materiais complementares do catálogo
  selectedMaterials: z.array(selectedMaterialSchema).optional(),

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
