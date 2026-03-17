"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMaterial } from "@/lib/materials/actions";
import { getMaterialById } from "./actions";

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

function parseDecimal(raw: string): number {
  const normalized = raw.replace(",", ".");
  const val = parseFloat(normalized);
  return isNaN(val) ? 0 : val;
}

function MoneyInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (raw: string, num: number) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder ?? "0,00"}
      value={value}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.,]/g, "");
        onChange(raw, parseDecimal(raw));
      }}
      className={`border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 ${className ?? ""}`}
    />
  );
}

function IntInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      step="1"
      placeholder={placeholder ?? "0"}
      value={value || ""}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className={`border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 ${className ?? ""}`}
    />
  );
}

// Formata número para exibição (usa ponto como decimal para o input)
function numToStr(n: number): string {
  return n > 0 ? String(n) : "";
}

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function EditMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("YARN");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [unit, setUnit] = useState<string>("GRAMS");

  const [costPerUnitStr, setCostPerUnitStr] = useState("");
  const [costPerUnit, setCostPerUnit] = useState(0);

  const [stockStr, setStockStr] = useState("");
  const [stock, setStock] = useState(0);

  const [lowStockMinStr, setLowStockMinStr] = useState("");
  const [lowStockMin, setLowStockMin] = useState(0);

  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  const [pricePerRollStr, setPricePerRollStr] = useState("");
  const [pricePerRoll, setPricePerRoll] = useState(0);
  const [weightPerRollStr, setWeightPerRollStr] = useState("");
  const [weightPerRoll, setWeightPerRoll] = useState(0);
  const [rolls, setRolls] = useState(0);

  const isYarn = category === "YARN";
  const autoCalcCost = isYarn && pricePerRoll > 0 && weightPerRoll > 0;
  const calculatedCostPerUnit = autoCalcCost
    ? Math.round((pricePerRoll / weightPerRoll) * 10000) / 10000
    : costPerUnit;
  const autoCalcStock = isYarn && weightPerRoll > 0 && rolls > 0;
  const calculatedStock = autoCalcStock ? weightPerRoll * rolls : stock;

  useEffect(() => {
    getMaterialById(id)
      .then((m) => {
        if (!m) {
          toast.error("Material não encontrado");
          router.push("/app/materials");
          return;
        }
        setName(m.name);
        setCategory(m.category);
        setBrand(m.brand ?? "");
        setColor(m.color ?? "");
        setUnit(m.unit);
        setCostPerUnit(m.costPerUnit);
        setCostPerUnitStr(numToStr(m.costPerUnit));
        setStock(m.stock);
        setStockStr(numToStr(m.stock));
        setLowStockMin(m.lowStockMin);
        setLowStockMinStr(numToStr(m.lowStockMin));
        setSupplier(m.supplier ?? "");
        setNotes(m.notes ?? "");
        if (m.pricePerRoll) {
          setPricePerRoll(m.pricePerRoll);
          setPricePerRollStr(numToStr(m.pricePerRoll));
        }
        if (m.weightPerRoll) {
          setWeightPerRoll(m.weightPerRoll);
          setWeightPerRollStr(numToStr(m.weightPerRoll));
        }
        if (m.rolls) {
          setRolls(m.rolls);
        }
      })
      .catch(() => {
        toast.error("Erro ao carregar material");
        router.push("/app/materials");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const finalCost = autoCalcCost ? calculatedCostPerUnit : costPerUnit;
    if (finalCost <= 0) {
      toast.error("Informe o custo por unidade");
      return;
    }

    setSaving(true);
    const result = await updateMaterial(id, {
      name,
      category: category as (typeof CATEGORIES)[number]["value"],
      brand: brand || undefined,
      color: color || undefined,
      unit: unit as (typeof UNITS)[number]["value"],
      costPerUnit: finalCost,
      stock: autoCalcStock ? calculatedStock : stock,
      lowStockMin,
      supplier: supplier || undefined,
      notes: notes || undefined,
      weightPerRoll: isYarn ? weightPerRoll || undefined : undefined,
      pricePerRoll: isYarn ? pricePerRoll || undefined : undefined,
      rolls: isYarn ? rolls || undefined : undefined,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Material atualizado!");
    router.push("/app/materials");
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
      <div>
        <Link
          href="/app/materials"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catálogo
        </Link>
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
          Editar Material
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="card-3d border-0 dark:border-rose-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-900 dark:text-white">
              Informações básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                Nome *
              </label>
              <Input
                required
                placeholder="Ex.: Fio Amigurumi Círculo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm dark:text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                  Unidade
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-md border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm dark:text-white"
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
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                  Marca
                </label>
                <Input
                  placeholder="Ex.: Círculo"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                  Cor
                </label>
                <Input
                  placeholder="Ex.: Rosa bebê"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card específico para fio/lã */}
        {isYarn && (
          <Card className="card-3d border-0 dark:border-rose-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-900 dark:text-white">
                🧶 Dados do rolo
              </CardTitle>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Informe os dados do rolo para calcular o custo por grama automaticamente
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                    Preço por rolo (R$)
                  </label>
                  <MoneyInput
                    value={pricePerRollStr}
                    onChange={(raw, num) => {
                      setPricePerRollStr(raw);
                      setPricePerRoll(num);
                    }}
                    placeholder="12,90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                    Peso por rolo (g)
                  </label>
                  <MoneyInput
                    value={weightPerRollStr}
                    onChange={(raw, num) => {
                      setWeightPerRollStr(raw);
                      setWeightPerRoll(num);
                    }}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                  Quantidade de rolos
                </label>
                <IntInput value={rolls} onChange={setRolls} placeholder="0" />
              </div>

              {autoCalcCost && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Custo por grama (calculado)
                    </span>
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      {brl(calculatedCostPerUnit)}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-500">
                    {brl(pricePerRoll)} ÷ {weightPerRoll}g = {brl(calculatedCostPerUnit)}/g
                  </p>
                </div>
              )}

              {autoCalcStock && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                      Estoque total (calculado)
                    </span>
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                      {calculatedStock}g
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-blue-600 dark:text-blue-500">
                    {rolls} rolos × {weightPerRoll}g = {calculatedStock}g
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="card-3d border-0 dark:border-rose-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-900 dark:text-white">
              Custo e estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                Custo por unidade (R$) *
              </label>
              {autoCalcCost ? (
                <div className="rounded-md border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {brl(calculatedCostPerUnit)}/g — calculado automaticamente
                </div>
              ) : (
                <>
                  <MoneyInput
                    value={costPerUnitStr}
                    onChange={(raw, num) => {
                      setCostPerUnitStr(raw);
                      setCostPerUnit(num);
                    }}
                    placeholder="0,05"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Ex.: Se o novelo custa R$ 12 e tem 100g, o custo/g é R$ 0,12
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                  {isYarn && autoCalcStock ? "Estoque (auto)" : "Estoque atual"}
                </label>
                {autoCalcStock ? (
                  <div className="rounded-md border border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                    {calculatedStock}g
                  </div>
                ) : (
                  <MoneyInput
                    value={stockStr}
                    onChange={(raw, num) => {
                      setStockStr(raw);
                      setStock(num);
                    }}
                    placeholder="0"
                  />
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                  Alerta estoque baixo
                </label>
                <MoneyInput
                  value={lowStockMinStr}
                  onChange={(raw, num) => {
                    setLowStockMinStr(raw);
                    setLowStockMin(num);
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                Fornecedor
              </label>
              <Input
                placeholder="Ex.: Bazar da Lã"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="border-rose-200 dark:border-rose-800/40 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-rose-300">
                Observações
              </label>
              <textarea
                rows={2}
                placeholder="Link da loja, número do lote, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-rose-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm dark:text-white dark:placeholder-gray-500"
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
            "Salvar alterações"
          )}
        </Button>
      </form>
    </div>
  );
}
