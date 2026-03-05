"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { yarnSchema, type YarnFormData, createYarn } from "@/app/app/inventory/actions";
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

export default function NewYarnPage() {
  const router = useRouter();

  const form = useForm<YarnFormData>({
    resolver: zodResolver(yarnSchema),
    defaultValues: {
      brand: "",
      line: "",
      color: "",
      gramsAvailable: 0,
      costTotal: 0,
      lowStockThreshold: 50,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: YarnFormData) {
    const result = await createYarn(data);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Fio adicionado com sucesso!");
    router.push("/app/inventory");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Back link */}
      <Button
        asChild
        variant="ghost"
        className="h-auto gap-1.5 px-0 text-rose-700 hover:bg-transparent hover:text-rose-900"
      >
        <Link href="/app/inventory">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao estoque
        </Link>
      </Button>

      <Card className="border-rose-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-rose-900">Adicionar fio</CardTitle>
          <CardDescription>
            Cadastre um novo fio para acompanhar seu estoque e custos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Brand */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Circulo, Pingouin, Anne"
                        className="border-rose-200 focus-visible:ring-rose-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Line */}
              <FormField
                control={form.control}
                name="line"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linha / Coleção</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Amigurumi, Barroco, Encanto (opcional)"
                        className="border-rose-200 focus-visible:ring-rose-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Rosa bebê, Branco gelo, Coral"
                        className="border-rose-200 focus-visible:ring-rose-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity + Cost side by side */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gramsAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade (g) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0"
                          className="border-rose-200 focus-visible:ring-rose-400"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : parseFloat(e.target.value)
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
                  name="costTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo total (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0,00"
                          className="border-rose-200 focus-visible:ring-rose-400"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Low stock threshold */}
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alerta de estoque baixo (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        placeholder="50"
                        className="border-rose-200 focus-visible:ring-rose-400"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 50 : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Você será avisada quando a quantidade cair abaixo deste valor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-rose-200 text-rose-700 hover:bg-rose-50"
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
                  {isSubmitting ? "Salvando..." : "Adicionar fio"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
