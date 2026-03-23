import { z } from "zod";

// ─────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────

const productStatusSchema = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);

const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, "Preco nao pode ser negativo").optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nome do produto e obrigatorio"),
  description: z.string().optional(),
  status: productStatusSchema,
  variant: variantSchema.optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Schema for update (supports multiple variants)
const updateVariantSchema = z.object({
  id: z.string().optional(), // existing variant id, undefined for new
  color: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, "Preco nao pode ser negativo").optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Nome do produto e obrigatorio"),
  description: z.string().optional(),
  status: productStatusSchema,
  variants: z.array(updateVariantSchema),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
