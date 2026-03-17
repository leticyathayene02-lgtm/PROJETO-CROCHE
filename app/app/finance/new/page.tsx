"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTransaction } from "@/app/app/finance/actions";

// ─────────────────────────────────────────
// Schema (mirrored from actions for client validation)
// ─────────────────────────────────────────

const schema = z.object({
  type: z.enum(["IN", "OUT"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z.number({ message: "Informe um valor válido" }).positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─────────────────────────────────────────
// Suggested categories
// ─────────────────────────────────────────

const IN_CATEGORIES = ["Venda de produto", "Encomenda", "Feira / exposição", "Outro"];
const OUT_CATEGORIES = ["Materiais / fios", "Ferramentas", "Embalagem", "Frete", "Marketing", "Outro"];

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function NewTransactionPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const type = watch("type");
  const suggestedCategories = type === "IN" ? IN_CATEGORIES : type === "OUT" ? OUT_CATEGORIES : [];

  async function onSubmit(values: FormValues) {
    const result = await createTransaction(values);
    if (result.success) {
      toast.success("Transação registrada com sucesso!");
      router.push("/app/finance");
    } else {
      toast.error(result.error ?? "Erro ao salvar transação");
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">
          <Link href="/app/finance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Nova transação</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Registre uma entrada ou saída financeira</p>
        </div>
      </div>

      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle className="text-base text-gray-900 dark:text-white">Detalhes da transação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-gray-900 dark:text-white">
                Tipo <span className="text-gray-500 dark:text-gray-400">*</span>
              </Label>
              <Select
                onValueChange={(v) => {
                  setValue("type", v as "IN" | "OUT", { shouldValidate: true });
                  setValue("category", ""); // reset category on type change
                }}
              >
                <SelectTrigger
                  id="type"
                  className={`border-rose-200 dark:border-white/10 focus:ring-rose-300 dark:focus:ring-rose-500/20 ${errors.type ? "border-red-400" : ""}`}
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Entrada
                    </span>
                  </SelectItem>
                  <SelectItem value="OUT">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                      Saída
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-gray-900 dark:text-white">
                Categoria <span className="text-gray-500 dark:text-gray-400">*</span>
              </Label>
              <Input
                id="category"
                placeholder="Ex: Venda de produto, Materiais..."
                {...register("category")}
                className={`border-rose-200 dark:border-white/10 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-500/20 ${errors.category ? "border-red-400" : ""}`}
              />
              {suggestedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {suggestedCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue("category", cat, { shouldValidate: true })}
                      className="text-xs px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Amount + Date side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-gray-900 dark:text-white">
                  Valor (R$) <span className="text-gray-500 dark:text-gray-400">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  {...register("amount", { valueAsNumber: true })}
                  className={`border-rose-200 dark:border-white/10 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-500/20 ${errors.amount ? "border-red-400" : ""}`}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500">{errors.amount.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-gray-900 dark:text-white">
                  Data <span className="text-gray-500 dark:text-gray-400">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  className={`border-rose-200 dark:border-white/10 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-500/20 ${errors.date ? "border-red-400" : ""}`}
                />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-gray-900 dark:text-white">
                Observações{" "}
                <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(opcional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre esta transação..."
                rows={3}
                {...register("notes")}
                className="border-rose-200 dark:border-white/10 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-500/20 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-rose-200 dark:border-rose-800/40 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                asChild
              >
                <Link href="/app/finance">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar transação"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
