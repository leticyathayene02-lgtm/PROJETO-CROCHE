import { z } from "zod";

export const materialSchema = z.object({
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
