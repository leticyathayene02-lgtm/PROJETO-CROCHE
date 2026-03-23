"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateTransaction } from "@/app/app/finance/actions";

const schema = z.object({
  type: z.enum(["IN", "OUT"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z.number({ message: "Informe um valor válido" }).positive("Valor deve ser positivo"),
  date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const IN_CATEGORIES = ["Venda de produto", "Encomenda", "Feira / exposição", "Outro"];
const OUT_CATEGORIES = ["Materiais / fios", "Ferramentas", "Embalagem", "Frete", "Marketing", "Outro"];

export function EditTransactionForm({
  id,
  defaultValues,
}: {
  id: string;
  defaultValues: FormValues;
}) {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const type = watch("type");
  const suggestedCategories = type === "IN" ? IN_CATEGORIES : OUT_CATEGORIES;

  async function onSubmit(values: FormValues) {
    const result = await updateTransaction(id, values);
    if (result.success) {
      toast.success("Transação atualizada!");
      router.push("/app/finance");
    } else {
      toast.error(result.error ?? "Erro ao atualizar");
    }
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-2 text-gray-500">
        <Link href="/app/finance"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
      </Button>
      <Card className="card-3d border-0">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                defaultValue={defaultValues.type}
                onValueChange={(v) => setValue("type", v as "IN" | "OUT", { shouldValidate: true })}
              >
                <SelectTrigger className="border-rose-200 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" />Entrada</span>
                  </SelectItem>
                  <SelectItem value="OUT">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400" />Saída</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Input
                placeholder="Ex: Encomenda, Materiais..."
                {...register("category")}
                className="border-rose-200 dark:border-white/10"
              />
              <div className="flex flex-wrap gap-1.5">
                {suggestedCategories.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => setValue("category", cat, { shouldValidate: true })}
                    className="text-xs px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >{cat}</button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" min="0.01" placeholder="0,00"
                  {...register("amount", { valueAsNumber: true })}
                  className="border-rose-200 dark:border-white/10"
                />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" {...register("date")} className="border-rose-200 dark:border-white/10" />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observações <span className="text-gray-400 font-normal text-xs">(opcional)</span></Label>
              <Textarea rows={3} placeholder="Informações adicionais..." {...register("notes")}
                className="border-rose-200 dark:border-white/10 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild className="flex-1 border-rose-200 dark:border-rose-800/40">
                <Link href="/app/finance">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
