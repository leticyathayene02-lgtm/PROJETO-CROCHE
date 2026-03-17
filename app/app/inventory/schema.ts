import { z } from "zod";

export const stockItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  color: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().int().min(0, "Quantidade não pode ser negativa"),
  price: z.number().min(0, "Preço não pode ser negativo").optional(),
  cost: z.number().min(0, "Custo não pode ser negativo").optional(),
  notes: z.string().optional(),
});

export type StockItemFormData = z.infer<typeof stockItemSchema>;
