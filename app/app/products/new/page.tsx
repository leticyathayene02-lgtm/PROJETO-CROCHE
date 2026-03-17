"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import {
  productSchema,
  type ProductFormData,
  createProduct,
} from "@/app/app/products/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function NewProductPage() {
  const router = useRouter();
  const [showVariant, setShowVariant] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
      variant: {
        color: "",
        size: "",
        sku: "",
        price: undefined,
      },
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: ProductFormData) {
    // Strip empty variant if section not shown or all fields blank
    const payload: ProductFormData = { ...data };
    if (!showVariant) {
      payload.variant = undefined;
    } else {
      const v = data.variant;
      const isEmpty =
        !v?.color && !v?.size && !v?.sku && v?.price === undefined;
      if (isEmpty) payload.variant = undefined;
    }

    const result = await createProduct(payload);

    if (!result.success) {
      if (result.upgradeRequired) {
        toast.error(result.error, {
          description: "Faça upgrade para o plano Premium para adicionar mais produtos.",
          action: {
            label: "Ver planos",
            onClick: () => router.push("/app/settings/billing"),
          },
        });
      } else {
        toast.error(result.error);
      }
      return;
    }

    toast.success("Produto criado com sucesso!");
    router.push("/app/products");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Back link */}
      <Button
        asChild
        variant="ghost"
        className="h-auto gap-1.5 px-0 text-gray-900 dark:text-white hover:bg-transparent hover:text-gray-900 dark:hover:text-white"
      >
        <Link href="/app/products">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos produtos
        </Link>
      </Button>

      <Card className="card-3d border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900 dark:text-white">Novo produto</CardTitle>
          <CardDescription>
            Adicione uma nova peça ao catálogo do seu ateliê.
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
                    <FormLabel>Nome do produto *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Sapatinho de bebê, Amigurumi urso"
                        className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhes, materiais, tamanhos disponíveis... (opcional)"
                        className="min-h-24 resize-none border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-rose-200 dark:border-white/10 dark:bg-white/5 focus:ring-rose-400 dark:focus:ring-rose-500/20">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativo</SelectItem>
                        <SelectItem value="DRAFT">Rascunho</SelectItem>
                        <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Produtos em rascunho não aparecem nos relatórios de vendas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="bg-rose-100 dark:bg-rose-800/30" />

              {/* Variant toggle */}
              <button
                type="button"
                onClick={() => setShowVariant((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <span>Adicionar variação (cor, tamanho, preço)</span>
                {showVariant ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>

              {/* Variant fields */}
              {showVariant && (
                <div className="space-y-4 rounded-xl border border-rose-100 dark:border-rose-800/30 bg-rose-50/30 dark:bg-rose-950/20 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="variant.color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Rosa, Azul"
                              className="border-rose-200 dark:border-rose-800/40 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20 bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="variant.size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: P, M, G, RN"
                              className="border-rose-200 dark:border-rose-800/40 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20 bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="variant.sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU / Código</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: SAP-001-P"
                              className="border-rose-200 dark:border-rose-800/40 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20 bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="variant.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0,00"
                              className="border-rose-200 dark:border-rose-800/40 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20 bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : parseFloat(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-rose-200 dark:border-rose-800/40 text-gray-900 dark:text-white hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  onClick={() => router.push("/app/products")}
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
                  {isSubmitting ? "Salvando..." : "Criar produto"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
