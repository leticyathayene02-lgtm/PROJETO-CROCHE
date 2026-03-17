"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { stockItemSchema, type StockItemFormData } from "@/app/app/inventory/schema";
import { updateStockItem, getStockItemById } from "@/app/app/inventory/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditStockItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);

  const form = useForm<StockItemFormData>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      name: "",
      color: "",
      size: "",
      quantity: 0,
      price: undefined,
      cost: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    async function load() {
      const item = await getStockItemById(id);
      if (!item) {
        toast.error("Item não encontrado");
        router.push("/app/inventory");
        return;
      }
      form.reset({
        name: item.name,
        color: item.color ?? "",
        size: item.size ?? "",
        quantity: item.quantity,
        price: item.price ?? undefined,
        cost: item.cost ?? undefined,
        notes: item.notes ?? "",
      });
      setLoading(false);
    }
    load();
  }, [id, form, router]);

  const { isSubmitting } = form.formState;

  async function onSubmit(data: StockItemFormData) {
    const result = await updateStockItem(id, data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Item atualizado!");
    router.push("/app/inventory");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Back link */}
      <Button
        asChild
        variant="ghost"
        className="h-auto gap-1.5 px-0 text-gray-900 dark:text-white hover:bg-transparent hover:text-gray-900 dark:hover:text-white"
      >
        <Link href="/app/inventory">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao estoque
        </Link>
      </Button>

      <Card className="card-3d border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900 dark:text-white">Editar peça</CardTitle>
          <CardDescription>
            Atualize as informações desta peça do estoque.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da peça *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Blusa de crochê, Amigurumi urso, Bolsa"
                        className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color + Size side by side */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Azul, Rosa bebê"
                          className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: P, M, G, Único"
                          className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        placeholder="0"
                        className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Quantas unidades prontas você tem disponíveis.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price + Cost side by side */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de venda (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0,00"
                          className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0,00"
                          className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Feita com linha premium, acabamento especial..."
                        rows={3}
                        className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-rose-200 dark:border-rose-800/40 text-gray-900 dark:text-white hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  onClick={() => router.push("/app/inventory")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
