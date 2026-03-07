"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMaterial } from "@/lib/materials/actions";

const CATEGORIES = [
  { value: "YARN", label: "Fio / Lã" },
  { value: "FILLING", label: "Enchimento" },
  { value: "EYES", label: "Olhos" },
  { value: "LABEL", label: "Etiqueta" },
  { value: "BUTTON", label: "Botão" },
  { value: "ZIPPER", label: "Zíper" },
  { value: "RING", label: "Argola" },
  { value: "PACKAGING", label: "Embalagem" },
  { value: "TAG", label: "Tag" },
  { value: "GIFT", label: "Mimo / Brinde" },
  { value: "OTHER", label: "Outro" },
] as const;

const UNITS = [
  { value: "GRAMS", label: "Gramas (g)" },
  { value: "METERS", label: "Metros (m)" },
  { value: "UNITS", label: "Unidades" },
  { value: "PACKS", label: "Pacotes" },
] as const;

export default function NewMaterialPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("YARN");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [unit, setUnit] = useState<string>("GRAMS");
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [stock, setStock] = useState(0);
  const [lowStockMin, setLowStockMin] = useState(0);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setSaving(true);
    const result = await createMaterial({
      name,
      category: category as typeof CATEGORIES[number]["value"],
      brand: brand || undefined,
      color: color || undefined,
      unit: unit as typeof UNITS[number]["value"],
      costPerUnit,
      stock,
      lowStockMin,
      supplier: supplier || undefined,
      notes: notes || undefined,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Material cadastrado!");
    router.push("/app/materials");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/app/materials"
          className="mb-3 inline-flex items-center gap-1 text-sm text-rose-400 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catálogo
        </Link>
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
          Novo Material
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cadastre um insumo para usar na calculadora de preços
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-rose-100 dark:border-rose-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-rose-900 dark:text-white">
              Informações básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                Nome *
              </label>
              <Input
                required
                placeholder="Ex.: Fio Amigurumi Círculo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-rose-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                  Unidade
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                  Marca
                </label>
                <Input
                  placeholder="Ex.: Círculo"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="border-rose-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                  Cor
                </label>
                <Input
                  placeholder="Ex.: Rosa bebê"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="border-rose-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 dark:border-rose-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-rose-900 dark:text-white">
              Custo e estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                Custo por unidade (R$) *
              </label>
              <Input
                type="number"
                step="any"
                min={0}
                placeholder="0.00"
                value={costPerUnit || ""}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="border-rose-200"
              />
              <p className="mt-1 text-xs text-rose-400">
                Ex.: Se o novelo custa R$ 12 e tem 100g, o custo/g é R$ 0,12
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                  Estoque atual
                </label>
                <Input
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0"
                  value={stock || ""}
                  onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                  className="border-rose-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                  Alerta estoque baixo
                </label>
                <Input
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0"
                  value={lowStockMin || ""}
                  onChange={(e) => setLowStockMin(parseFloat(e.target.value) || 0)}
                  className="border-rose-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                Fornecedor
              </label>
              <Input
                placeholder="Ex.: Bazar da Lã"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="border-rose-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                Observações
              </label>
              <textarea
                rows={2}
                placeholder="Link da loja, número do lote, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-rose-600 hover:bg-rose-700"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Cadastrar material"
          )}
        </Button>
      </form>
    </div>
  );
}
