"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Info,
  AlertCircle,
  Banknote,
  CreditCard,
  ShieldCheck,
  Plus,
  Trash2,
  Package,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  createPricingCalculation,
  getWorkspaceMaterials,
  type CatalogMaterial,
} from "../actions";
import {
  computePricingTotals,
  getPricingAlerts,
  type PricingInputs,
  type PricingAlert,
  type ProfitMode,
} from "@/lib/pricing";
import type { SelectedMaterial } from "../schema";

// ─── Helpers ────────────────────────────────────────────────────────

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(isNaN(v) ? 0 : v);

const UNIT_LABELS: Record<string, string> = {
  GRAMS: "g",
  METERS: "m",
  UNITS: "un",
  PACKS: "pct",
};

const CATEGORY_LABELS: Record<string, string> = {
  YARN: "Fio / Lã",
  FILLING: "Enchimento",
  EYES: "Olhos",
  LABEL: "Etiqueta",
  BUTTON: "Botão",
  ZIPPER: "Zíper",
  RING: "Argola",
  PACKAGING: "Embalagem",
  TAG: "Tag",
  GIFT: "Mimo",
  OTHER: "Outro",
};

// Parse valor: aceita "0,05" ou "0.05"
function parseDecimal(raw: string): number {
  const normalized = raw.replace(",", ".");
  const val = parseFloat(normalized);
  return isNaN(val) ? 0 : val;
}

function NumInput({
  value,
  onChange,
  placeholder,
  className,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
  step?: string;
}) {
  const [raw, setRaw] = useState(value > 0 ? String(value) : "");
  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder ?? "0"}
      value={raw}
      onChange={(e) => {
        const input = e.target.value.replace(/[^0-9.,]/g, "");
        setRaw(input);
        onChange(parseDecimal(input));
      }}
      onBlur={() => {
        // Limpa o display no blur (remove zeros à esquerda, etc.)
        const num = parseDecimal(raw);
        setRaw(num > 0 ? String(num) : "");
      }}
      className={`border-rose-200 dark:border-rose-800/40 bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20 ${className ?? ""}`}
    />
  );
}

// ─── Material complementar row ──────────────────────────────────────

function MaterialRow({
  item,
  catalogMaterials,
  onUpdate,
  onRemove,
}: {
  item: SelectedMaterial;
  catalogMaterials: CatalogMaterial[];
  onUpdate: (updated: SelectedMaterial) => void;
  onRemove: () => void;
}) {
  const mat = catalogMaterials.find((m) => m.id === item.materialId);
  const unitLabel = UNIT_LABELS[item.unit] || item.unit;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-rose-100 dark:border-rose-800/30 bg-white dark:bg-white/5 px-3 py-2.5 transition-colors hover:border-rose-200 dark:hover:border-rose-700/40">
      <Package className="h-4 w-4 text-rose-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {item.name}
          </span>
          {mat?.brand && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate hidden sm:inline">
              {mat.brand}
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          {brl(item.costPerUnit)}/{unitLabel}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={item.quantity > 0 ? String(item.quantity) : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.,]/g, "");
            const qty = parseDecimal(raw);
            onUpdate({
              ...item,
              quantity: qty,
              cost: Math.round(qty * item.costPerUnit * 100) / 100,
            });
          }}
          className="w-[70px] h-8 text-sm border-rose-200 dark:border-rose-800/40 bg-white dark:bg-white/5 dark:text-white focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
        />
        <span className="text-xs text-gray-400 dark:text-gray-500 w-5">{unitLabel}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums w-20 text-right shrink-0">
        {brl(item.cost)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:text-gray-600 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
        title="Remover"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────

export default function NewPricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);

  // Catalog materials from DB
  const [catalogMaterials, setCatalogMaterials] = useState<CatalogMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useEffect(() => {
    getWorkspaceMaterials()
      .then(setCatalogMaterials)
      .catch(() => toast.error("Erro ao carregar materiais"))
      .finally(() => setLoadingMaterials(false));
  }, []);

  // Prefill from query params (used by "Usar novamente")
  const prefill = useMemo(() => {
    const raw = searchParams.get("prefill");
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }, [searchParams]);

  // Form state
  const [name, setName] = useState(prefill?.name ?? "");
  const [material, setMaterial] = useState<number>(prefill?.material ?? 0);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>(
    prefill?.selectedMaterials ?? []
  );

  const [horas, setHoras] = useState<number>(prefill?.horas ?? 0);
  const [valorHora, setValorHora] = useState<number>(prefill?.valorHora ?? 0);

  const [taxaCartao, setTaxaCartao] = useState<number>(prefill?.taxaCartao ?? 0);
  const [impostoMarketplace, setImpostoMarketplace] = useState<number>(prefill?.impostoMarketplace ?? 0);

  const [profitMode, setProfitMode] = useState<ProfitMode>(prefill?.profitMode ?? "percent");
  const [margemPercent, setMargemPercent] = useState<number>(prefill?.margemPercent ?? 30);
  const [lucroFixo, setLucroFixo] = useState<number>(prefill?.lucroFixo ?? 0);

  // Material selector state
  const [showSelector, setShowSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered materials for selector (exclude already selected)
  const availableMaterials = useMemo(() => {
    const selectedIds = new Set(selectedMaterials.map((m) => m.materialId));
    return catalogMaterials.filter(
      (m) =>
        !selectedIds.has(m.id) &&
        (searchTerm === "" ||
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.brand && m.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          CATEGORY_LABELS[m.category]?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [catalogMaterials, selectedMaterials, searchTerm]);

  // Soma dos materiais complementares do catálogo
  const complementaresTotal = useMemo(
    () => selectedMaterials.reduce((sum, m) => sum + m.cost, 0),
    [selectedMaterials]
  );

  // Add material from catalog
  const addMaterial = useCallback(
    (mat: CatalogMaterial) => {
      setSelectedMaterials((prev) => [
        ...prev,
        {
          materialId: mat.id,
          name: mat.name,
          unit: mat.unit,
          costPerUnit: mat.costPerUnit,
          quantity: 0,
          cost: 0,
        },
      ]);
      setShowSelector(false);
      setSearchTerm("");
    },
    []
  );

  // Compute em tempo real
  const inputs: PricingInputs = useMemo(
    () => ({
      material,
      embalagem: 0,
      mimo: 0,
      acessorios: 0,
      grafica: 0,
      complementares: complementaresTotal,
      horas,
      valorHora,
      taxaCartao,
      impostoMarketplace,
      profitMode,
      margemPercent,
      lucroFixo,
      name,
      selectedMaterials,
    }),
    [material, complementaresTotal, horas, valorHora, taxaCartao, impostoMarketplace, profitMode, margemPercent, lucroFixo, name, selectedMaterials]
  );

  const totals = useMemo(() => computePricingTotals(inputs), [inputs]);
  const alerts = useMemo(() => getPricingAlerts(inputs, totals), [inputs, totals]);

  // Submit
  async function onSubmit() {
    setSaving(true);
    const result = await createPricingCalculation({
      name,
      material,
      selectedMaterials,
      horas,
      valorHora,
      taxaCartao,
      impostoMarketplace,
      profitMode,
      margemPercent,
      lucroFixo,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Cálculo salvo com sucesso!");
    router.push("/app/pricing");
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-24">
      {/* Header */}
      <div>
        <Link
          href="/app/pricing"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao histórico
        </Link>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Calculadora de Preços
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Descubra o preço ideal da sua peça
        </p>
      </div>

      {/* Nome */}
      <Card className="border-rose-100 dark:border-rose-800/30">
        <CardContent className="pt-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white">
            Nome da peça (opcional)
          </label>
          <Input
            placeholder="Ex.: Amigurumi urso GG"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-rose-200 dark:border-rose-800/40 bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
          />
        </CardContent>
      </Card>

      {/* ── Card: Custos de Material ────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            💰 Custos de Material
          </CardTitle>
          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Informe o custo da linha/fio e adicione materiais complementares do seu catálogo
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo manual: linha/fio principal */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Linha / Fio principal (R$)
            </label>
            <NumInput value={material} onChange={setMaterial} placeholder="0.00" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Custo do fio, linha ou lã usado na peça
            </p>
          </div>

          {/* Materiais complementares do catálogo */}
          {selectedMaterials.length > 0 && (
            <div className="space-y-2">
              {selectedMaterials.map((item, idx) => (
                <MaterialRow
                  key={item.materialId}
                  item={item}
                  catalogMaterials={catalogMaterials}
                  onUpdate={(updated) =>
                    setSelectedMaterials((prev) =>
                      prev.map((m, i) => (i === idx ? updated : m))
                    )
                  }
                  onRemove={() =>
                    setSelectedMaterials((prev) => prev.filter((_, i) => i !== idx))
                  }
                />
              ))}
            </div>
          )}

          {/* Botão "+" para adicionar complementar */}
          {loadingMaterials ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando materiais...
            </div>
          ) : catalogMaterials.length === 0 ? (
            <Link
              href="/app/materials/new"
              className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
            >
              <Plus className="h-4 w-4" />
              Cadastrar materiais para usar aqui
            </Link>
          ) : showSelector ? (
            <div className="space-y-2">
              <Input
                autoFocus
                placeholder="Buscar material por nome, marca ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-rose-200 dark:border-rose-800/40 bg-white dark:bg-white/5 dark:text-white dark:placeholder-gray-500 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-500/20"
              />
              <div className="max-h-48 overflow-y-auto rounded-xl border border-rose-100 dark:border-rose-800/30 bg-white dark:bg-white/5">
                {availableMaterials.length === 0 ? (
                  <p className="p-3 text-center text-sm text-gray-400 dark:text-gray-500">
                    {searchTerm
                      ? "Nenhum material encontrado"
                      : "Todos os materiais já foram adicionados"}
                  </p>
                ) : (
                  availableMaterials.map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => addMaterial(mat)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/20 border-b border-rose-50 dark:border-rose-900/20 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {mat.name}
                          </span>
                          <span className="shrink-0 rounded-full bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300">
                            {CATEGORY_LABELS[mat.category] || mat.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {mat.brand && `${mat.brand} · `}
                          {mat.color && `${mat.color} · `}
                          {brl(mat.costPerUnit)}/{UNIT_LABELS[mat.unit] || mat.unit}
                          {mat.stock > 0 && ` · ${mat.stock} ${UNIT_LABELS[mat.unit] || mat.unit} em estoque`}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 shrink-0 text-rose-400" />
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSelector(false);
                  setSearchTerm("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSelector(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Plus className="h-4 w-4" />
              Adicionar material complementar
            </button>
          )}

          {/* Total materiais */}
          {totals.materialTotal > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800/30 px-3 py-2.5">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total de materiais</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{brl(totals.materialTotal)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card: Tempo ───────────────────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-900 dark:text-white">
            ⏱️ Tempo de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Horas gastas
              </label>
              <NumInput value={horas} onChange={setHoras} placeholder="0" step="0.5" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Aceita decimal (ex: 2.5)</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Valor da hora (R$)
              </label>
              <NumInput value={valorHora} onChange={setValorHora} placeholder="25" />
            </div>
          </div>
          {totals.maoObra > 0 && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-950/20 px-3 py-2">
              <span className="text-xs font-medium text-gray-900 dark:text-white">Mão de obra</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{brl(totals.maoObra)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card: Taxas ───────────────────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-900 dark:text-white">
            📊 Taxas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Taxa do cartão (%)
              </label>
              <NumInput value={taxaCartao} onChange={setTaxaCartao} placeholder="0" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Maquininha, gateway</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Imposto / Marketplace (%)
              </label>
              <NumInput value={impostoMarketplace} onChange={setImpostoMarketplace} placeholder="0" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">MEI, Elo7, Shopee...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card: Lucro ───────────────────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-800/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-900 dark:text-white">
            🎯 Lucro Desejado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Toggle */}
          <div className="flex rounded-xl bg-rose-100/60 dark:bg-rose-900/40 p-1">
            <button
              type="button"
              onClick={() => setProfitMode("percent")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                profitMode === "percent"
                  ? "bg-white dark:bg-[oklch(0.18_0.01_280)] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              % sobre custo
            </button>
            <button
              type="button"
              onClick={() => setProfitMode("fixed")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                profitMode === "fixed"
                  ? "bg-white dark:bg-[oklch(0.18_0.01_280)] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Valor fixo (R$)
            </button>
          </div>

          {/* Guia de margem */}
          <div className="space-y-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 p-3">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">Como escolher a margem?</p>
            <div className="space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300">
              <p className="font-medium">Por tempo de produção:</p>
              <div className="grid grid-cols-3 gap-1.5">
                <button type="button" onClick={() => { setProfitMode("percent"); setMargemPercent(35); }} className="rounded-lg border border-rose-200 dark:border-rose-800/40 bg-white dark:bg-[oklch(0.18_0.01_280)] px-2 py-1.5 text-center transition hover:border-rose-400 dark:hover:border-rose-500">
                  <span className="block font-bold text-gray-900 dark:text-white">30–40%</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">~1h ou menos</span>
                </button>
                <button type="button" onClick={() => { setProfitMode("percent"); setMargemPercent(50); }} className="rounded-lg border border-rose-200 dark:border-rose-800/40 bg-white dark:bg-[oklch(0.18_0.01_280)] px-2 py-1.5 text-center transition hover:border-rose-400 dark:hover:border-rose-500">
                  <span className="block font-bold text-gray-900 dark:text-white">40–60%</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">2–3 horas</span>
                </button>
                <button type="button" onClick={() => { setProfitMode("percent"); setMargemPercent(80); }} className="rounded-lg border border-rose-200 dark:border-rose-800/40 bg-white dark:bg-[oklch(0.18_0.01_280)] px-2 py-1.5 text-center transition hover:border-rose-400 dark:hover:border-rose-500">
                  <span className="block font-bold text-gray-900 dark:text-white">60–100%</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">muitas horas</span>
                </button>
              </div>
              <p className="mt-1 font-medium">Por exclusividade:</p>
              <div className="grid grid-cols-3 gap-1.5">
                <button type="button" onClick={() => { setProfitMode("percent"); setMargemPercent(40); }} className="rounded-lg border border-rose-200 dark:border-rose-800/40 bg-white dark:bg-[oklch(0.18_0.01_280)] px-2 py-1.5 text-center transition hover:border-rose-400 dark:hover:border-rose-500">
                  <span className="block font-bold text-gray-900 dark:text-white">30–50%</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">peça comum</span>
                </button>
                <button type="button" onClick={() => { setProfitMode("percent"); setMargemPercent(65); }} className="rounded-lg border border-rose-200 dark:border-rose-800/40 bg-white dark:bg-[oklch(0.18_0.01_280)] px-2 py-1.5 text-center transition hover:border-rose-400 dark:hover:border-rose-500">
                  <span className="block font-bold text-gray-900 dark:text-white">50–80%</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">personalizada</span>
                </button>
                <button type="button" onClick={() => { setProfitMode("percent"); setMargemPercent(100); }} className="rounded-lg border border-rose-200 dark:border-rose-800/40 bg-white dark:bg-[oklch(0.18_0.01_280)] px-2 py-1.5 text-center transition hover:border-rose-400 dark:hover:border-rose-500">
                  <span className="block font-bold text-gray-900 dark:text-white">até 100%</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">peça única</span>
                </button>
              </div>
            </div>
          </div>

          {profitMode === "percent" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Margem de lucro (%)
              </label>
              <NumInput value={margemPercent} onChange={setMargemPercent} placeholder="30" />
              {totals.custoBase > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  = {brl(totals.lucroAlvo)} de lucro sobre {brl(totals.custoBase)} de custo
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                Lucro desejado (R$)
              </label>
              <NumInput value={lucroFixo} onChange={setLucroFixo} placeholder="50" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Alerts ────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <AlertBox key={i} alert={a} />
          ))}
        </div>
      )}

      {/* ── Card: Resultado ───────────────────────────────────────────── */}
      <Card className="border-rose-200 dark:border-rose-800/40 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            Resultado
          </CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Custo base: {brl(totals.custoBase)} (materiais {brl(totals.materialTotal)} + mão de obra {brl(totals.maoObra)})
          </p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* ── PIX ── */}
          <div className="rounded-2xl bg-emerald-600 p-4 text-white">
            <div className="mb-2 flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              <span className="text-sm font-semibold">PIX / À vista</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-emerald-200">Preço sugerido</p>
                <p className="font-heading text-3xl font-extrabold tracking-tight">
                  {brl(totals.precoPix)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-200">Lucro líquido</p>
                <p className="text-lg font-bold">
                  {brl(totals.lucroLiquidoPix)}
                </p>
                <p className="text-xs text-emerald-300">
                  {totals.lucroPercentPix.toFixed(1)}% do preço
                </p>
              </div>
            </div>
          </div>

          {/* ── Cartão ── */}
          <div className="rounded-2xl bg-blue-600 p-4 text-white">
            <div className="mb-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Cartão / Marketplace
                {(taxaCartao > 0 || impostoMarketplace > 0) &&
                  ` (${taxaCartao + impostoMarketplace}%)`}
              </span>
            </div>
            {totals.taxaError ? (
              <p className="text-sm text-red-200">{totals.taxaError}</p>
            ) : (
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-blue-200">Preço sugerido</p>
                  <p className="font-heading text-3xl font-extrabold tracking-tight">
                    {brl(totals.precoCartao)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-200">Lucro líquido</p>
                  <p className="text-lg font-bold">
                    {brl(totals.lucroLiquidoCartao)}
                  </p>
                  <p className="text-xs text-blue-300">
                    {totals.lucroPercentCartao.toFixed(1)}% do preço
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Break-even ── */}
          <div className="flex gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 px-3 py-2.5 border border-amber-200 dark:border-amber-800/40">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-amber-600">
                  Break-even PIX
                </p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {brl(totals.breakevenPix)}
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/40 px-3 py-2.5 border border-amber-200 dark:border-amber-800/40">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-amber-600">
                  Break-even Cartão
                </p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {totals.taxaError ? "—" : brl(totals.breakevenCartao)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Resumo detalhado ── */}
          <div className="space-y-1 rounded-xl bg-white/80 dark:bg-white/5 p-3 text-sm">
            {material > 0 && <Row label="Linha / Fio principal" value={material} />}
            {selectedMaterials.filter(m => m.cost > 0).map((m) => (
              <Row
                key={m.materialId}
                label={`${m.name} (${m.quantity} ${UNIT_LABELS[m.unit] || m.unit})`}
                value={m.cost}
              />
            ))}
            <Row label="Material total" value={totals.materialTotal} />
            <Row label="Mão de obra" value={totals.maoObra} />
            <div className="my-1.5 border-t border-rose-100 dark:border-rose-800/30" />
            <Row label="Custo base" value={totals.custoBase} bold />
            <Row label="Lucro alvo" value={totals.lucroAlvo} />
            <div className="my-1.5 border-t border-rose-100 dark:border-rose-800/30" />
            <Row label="Preço PIX" value={totals.precoPix} bold accent />
            {!totals.taxaError && (
              <Row label="Preço Cartão" value={totals.precoCartao} bold accent />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Salvar ────────────────────────────────────────────────────── */}
      <Button
        onClick={onSubmit}
        disabled={saving || totals.custoBase === 0}
        className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
        size="lg"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar cálculo"
        )}
      </Button>
    </div>
  );
}

// ─── Sub components ─────────────────────────────────────────────────

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={`${bold ? "font-semibold" : ""} text-gray-900 dark:text-white`}>
        {label}
      </span>
      <span className={`tabular-nums ${bold ? "font-bold" : "font-medium"} text-gray-900 dark:text-white`}>
        {brl(value)}
      </span>
    </div>
  );
}

function AlertBox({ alert }: { alert: PricingAlert }) {
  const config = {
    danger: {
      bg: "bg-red-50 border-red-200 dark:bg-red-900/40 dark:border-red-800/40",
      text: "text-red-700 dark:text-red-400",
      icon: <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/40 dark:border-amber-800/40",
      text: "text-amber-700 dark:text-amber-400",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800/40",
      text: "text-blue-700 dark:text-blue-400",
      icon: <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
    },
  }[alert.type];

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3 ${config.bg}`}>
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <p className={`text-sm ${config.text}`}>{alert.message}</p>
    </div>
  );
}
