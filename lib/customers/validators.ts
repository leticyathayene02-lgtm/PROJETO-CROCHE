import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
