"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

import {
  updateProductSchema,
  type UpdateProductFormData,
  updateProduct,
  archiveProduct,
  deleteProduct,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductWithVariants {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  variants: {
    id: string;
    color: string | null;
    size: string | null;
    sku: string | null;
    price: number | null;
  }[];
}

interface Props {
  product: ProductWithVariants;
}

export function EditProductForm({ product }: Props) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<UpdateProductFormData>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
      status: product.status,
      variants: product.variants.map((v) => ({
        id: v.id,
        color: v.color ?? "",
        size: v.size ?? "",
        sku: v.sku ?? "",
        price: v.price ?? undefined,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: UpdateProductFormData) {
    // Filter out empty variants (all fields blank)
    const cleanVariants = data.variants.filter(
      (v) => v.color || v.size || v.sku || v.price !== undefined
    );

    const result = await updateProduct(product.id, {
      ...data,
      variants: cleanVariants,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Produto atualizado com sucesso!");
    router.push("/app/products");
  }

  async function handleArchive() {
    setIsArchiving(true);
    const result = await archiveProduct(product.id);
    setIsArchiving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Produto arquivado com sucesso!");
    router.push("/app/products");
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteProduct(product.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Produto excluído permanentemente.");
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

      {/* Main form card */}
      <Card className="card-3d border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            Editar produto
          </CardTitle>
          <CardDescription>
            Atualize as informações e variações do produto.
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

              {/* Variants section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Variações ({fields.length})
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-rose-200 dark:border-rose-800/40 text-gray-900 dark:text-white hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={() =>
                      append({ color: "", size: "", sku: "", price: undefined })
                    }
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Adicionar variação
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-rose-200 dark:border-rose-800/40 bg-rose-50/30 dark:bg-rose-950/20 px-4 py-6 text-center">
                    Nenhuma variação cadastrada. Clique em &quot;Adicionar
                    variação&quot; para criar.
                  </p>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-xl border border-rose-100 dark:border-rose-800/30 bg-rose-50/30 dark:bg-rose-950/20 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Variacao {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`variants.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Cor</FormLabel>
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
                        name={`variants.${index}.size`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Tamanho</FormLabel>
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

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`variants.${index}.sku`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              SKU / Código
                            </FormLabel>
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
                        name={`variants.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Preço (R$)
                            </FormLabel>
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
                ))}
              </div>

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
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-gray-900 dark:text-white">
            Zona de perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis ou que afetam a visibilidade do produto.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Archive */}
          {product.status !== "ARCHIVED" && (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Arquivar produto
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  O produto será ocultado da listagem mas pode ser restaurado.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 self-start sm:self-auto"
                onClick={handleArchive}
                disabled={isArchiving}
              >
                {isArchiving ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Archive className="mr-1.5 h-3.5 w-3.5" />
                )}
                Arquivar
              </Button>
            </div>
          )}

          {/* Delete permanently */}
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Excluir permanentemente
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Essa ação não pode ser desfeita. Todas as variações serão
                excluídas.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 self-start sm:self-auto"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Excluir produto
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir{" "}
                    <strong>{product.name}</strong>? Essa ação é permanente e não
                    pode ser desfeita. Todas as variações do produto também serão
                    excluídas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDelete}
                  >
                    Sim, excluir permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
