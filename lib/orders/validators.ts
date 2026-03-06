import { z } from "zod";

export const orderSchema = z.object({
  orderDate: z.string().min(1, "Data do pedido é obrigatória"),
  customerName: z.string().min(1, "Nome da cliente é obrigatório"),
  customerId: z.string().optional(),
  itemDescription: z.string().min(1, "Descrição da peça é obrigatória"),
  dueDate: z.string().min(1, "Data prevista de entrega é obrigatória"),
  amount: z.number({ message: "Valor é obrigatório" }).positive("Valor deve ser positivo"),
  paymentStatus: z.enum(["UNPAID", "HALF_PAID", "PAID"]),
  productionStatus: z.enum(["TODO", "IN_PROGRESS", "FINISHING", "READY", "DELIVERED"]).optional(),
  notes: z.string().optional(),
  channel: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Não pago",
  HALF_PAID: "50% pago",
  PAID: "Pago",
};

export const productionStatusLabels: Record<string, string> = {
  TODO: "A fazer",
  IN_PROGRESS: "Em produção",
  FINISHING: "Acabamento",
  READY: "Pronto",
  DELIVERED: "Entregue",
};

export const CHANNELS = [
  "Instagram",
  "WhatsApp",
  "Feira",
  "Indicação",
  "Outro",
];

export const CHECKLIST_TEMPLATES = [
  "Separar material",
  "Produzir",
  "Acabamento",
  "Embalagem",
  "Enviar",
];

export type ChecklistItem = { text: string; done: boolean };
