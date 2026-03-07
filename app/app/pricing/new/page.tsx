"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { createPricingCalculation } from "../actions";
import {
  computePricingTotals,
  getPricingAlerts,
  DEFAULT_SCENARIOS,
  type PricingInputs,
  type MaterialItem,
  type LaborStage,
  type OverheadItem,
  type SalesScenario,
  type PricingAlert,
} from "@/lib/pricing";

// ─── Helpers ────────────────────────────────────────────────────────

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(isNaN(v) ? 0 : v);

function NumInput({
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
      inputMode="decimal"
      min={0}
      step="any"
      placeholder={placeholder ?? "0"}
      value={value || ""}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={`border-rose-200 bg-white focus-visible:ring-rose-400 ${className ?? ""}`}
    />
  );
}

// ─── Main ───────────────────────────────────────────────────────────

export default function NewPricingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [name, setName] = useState("");
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { name: "Fio principal", unit: "g", quantity: 0, costPerUnit: 0 },
  ]);
  const [laborStages, setLaborStages] = useState<LaborStage[]>([
    { name: "Produção", minutes: 0 },
    { name: "Acabamento", minutes: 0 },
    { name: "Embalagem", minutes: 0 },
  ]);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [overheadItems, setOverheadItems] = useState<OverheadItem[]>([
    { name: "Aluguel / espaço", monthlyAmount: 0 },
    { name: "Internet", monthlyAmount: 0 },
    { name: "Energia", monthlyAmount: 0 },
  ]);
  const [monthlyHoursWorked, setMonthlyHoursWorked] = useState(160);
  const [profitMarginPercent, setProfitMarginPercent] = useState(30);
  const [taxPercent, setTaxPercent] = useState(0);
  const [scenarios] = useState<SalesScenario[]>([...DEFAULT_SCENARIOS]);

  // Compute
  const inputs: PricingInputs = useMemo(
    () => ({
      materials,
      laborStages,
      hourlyRate,
      overheadItems,
      monthlyHoursWorked,
      profitMarginPercent,
      taxPercent,
      scenarios,
    }),
    [materials, laborStages, hourlyRate, overheadItems, monthlyHoursWorked, profitMarginPercent, taxPercent, scenarios]
  );

  const totals = useMemo(() => computePricingTotals(inputs), [inputs]);
  const alerts = useMemo(() => getPricingAlerts(inputs, totals), [inputs, totals]);

  // Material handlers
  const addMaterial = useCallback(() => {
    setMaterials((m) => [...m, { name: "", unit: "un", quantity: 0, costPerUnit: 0 }]);
  }, []);
  const removeMaterial = useCallback((i: number) => {
    setMaterials((m) => m.filter((_, idx) => idx !== i));
  }, []);
  const updateMaterial = useCallback((i: number, field: keyof MaterialItem, value: string | number) => {
    setMaterials((m) => m.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }, []);

  // Labor handlers
  const addLaborStage = useCallback(() => {
    setLaborStages((s) => [...s, { name: "", minutes: 0 }]);
  }, []);
  const removeLaborStage = useCallback((i: number) => {
    setLaborStages((s) => s.filter((_, idx) => idx !== i));
  }, []);
  const updateLaborStage = useCallback((i: number, field: keyof LaborStage, value: string | number) => {
    setLaborStages((s) => s.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }, []);

  // Overhead handlers
  const addOverhead = useCallback(() => {
    setOverheadItems((o) => [...o, { name: "", monthlyAmount: 0 }]);
  }, []);
  const removeOverhead = useCallback((i: number) => {
    setOverheadItems((o) => o.filter((_, idx) => idx !== i));
  }, []);
  const updateOverhead = useCallback((i: number, field: keyof OverheadItem, value: string | number) => {
    setOverheadItems((o) => o.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }, []);

  // Submit
  async function onSubmit() {
    setSaving(true);
    const result = await createPricingCalculation({
      name,
      materials,
      laborStages,
      hourlyRate,
      overheadItems,
      monthlyHoursWorked,
      profitMarginPercent,
      taxPercent,
      scenarios,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Cálculo salvo com sucesso!");
    router.push("/app/pricing");
  }

  const totalMinutesFormatted = totals.totalMinutes >= 60
    ? `${Math.floor(totals.totalMinutes / 60)}h${totals.totalMinutes % 60 > 0 ? ` ${totals.totalMinutes % 60}min` : ""}`
    : `${totals.totalMinutes}min`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      {/* Header */}
      <div>
        <Link
          href="/app/pricing"
          className="mb-3 inline-flex items-center gap-1 text-sm text-rose-400 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao histórico
        </Link>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-rose-900 dark:text-white">
          Motor de Precificação
        </h1>
        <p className="mt-1 text-sm text-rose-500 dark:text-rose-400">
          Calcule o preço ideal considerando materiais, tempo, custos fixos e canais de venda
        </p>
      </div>

      {/* Name */}
      <Card className="border-rose-100 dark:border-rose-900/30">
        <CardContent className="pt-5">
          <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
            Nome do cálculo (opcional)
          </label>
          <Input
            placeholder="Ex.: Amigurumi urso GG"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-rose-200 bg-white focus-visible:ring-rose-400"
          />
        </CardContent>
      </Card>

      {/* ── Materials ────────────────────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900 dark:text-white">
            Materiais
          </CardTitle>
          <CardDescription>Todos os insumos usados na peça</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {materials.map((m, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                <Input
                  placeholder="Material"
                  value={m.name}
                  onChange={(e) => updateMaterial(i, "name", e.target.value)}
                  className="col-span-2 border-rose-200 bg-white text-sm sm:col-span-1"
                />
                <select
                  value={m.unit}
                  onChange={(e) => updateMaterial(i, "unit", e.target.value)}
                  className="rounded-md border border-rose-200 bg-white px-2 py-2 text-sm"
                >
                  <option value="g">gramas</option>
                  <option value="m">metros</option>
                  <option value="un">unidades</option>
                  <option value="pct">pacotes</option>
                </select>
                <NumInput
                  value={m.quantity}
                  onChange={(v) => updateMaterial(i, "quantity", v)}
                  placeholder="Qtd"
                />
                <NumInput
                  value={m.costPerUnit}
                  onChange={(v) => updateMaterial(i, "costPerUnit", v)}
                  placeholder="R$/un"
                />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="whitespace-nowrap text-xs font-semibold text-rose-600">
                  {brl(m.quantity * m.costPerUnit)}
                </span>
                {materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMaterial(i)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMaterial}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Adicionar material
          </Button>
        </CardContent>
      </Card>

      {/* ── Labor ────────────────────────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900 dark:text-white">
            Mão de obra
          </CardTitle>
          <CardDescription>Tempo por etapa + valor/hora</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {laborStages.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Etapa"
                value={s.name}
                onChange={(e) => updateLaborStage(i, "name", e.target.value)}
                className="flex-1 border-rose-200 bg-white text-sm"
              />
              <div className="flex items-center gap-1">
                <NumInput
                  value={s.minutes}
                  onChange={(v) => updateLaborStage(i, "minutes", v)}
                  placeholder="min"
                  className="w-20"
                />
                <span className="text-xs text-gray-400">min</span>
              </div>
              {laborStages.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLaborStage(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLaborStage}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Adicionar etapa
          </Button>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-rose-50 p-3 dark:bg-rose-950/20">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-rose-700 dark:text-rose-300">
                Valor da sua hora (R$/h)
              </label>
              <NumInput value={hourlyRate} onChange={setHourlyRate} placeholder="25" />
            </div>
            <div className="text-right">
              <p className="text-xs text-rose-400">Tempo total</p>
              <p className="text-sm font-bold text-rose-700">{totalMinutesFormatted}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Overhead ─────────────────────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900 dark:text-white">
            Custos fixos do ateliê
          </CardTitle>
          <CardDescription>
            Rateio automático por horas trabalhadas no mês
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {overheadItems.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Custo"
                value={o.name}
                onChange={(e) => updateOverhead(i, "name", e.target.value)}
                className="flex-1 border-rose-200 bg-white text-sm"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">R$</span>
                <NumInput
                  value={o.monthlyAmount}
                  onChange={(v) => updateOverhead(i, "monthlyAmount", v)}
                  placeholder="0"
                  className="w-24"
                />
                <span className="text-xs text-gray-400">/mês</span>
              </div>
              {overheadItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOverhead(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOverhead}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Adicionar custo fixo
          </Button>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-rose-50 p-3 dark:bg-rose-950/20">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-rose-700 dark:text-rose-300">
                Horas trabalhadas por mês
              </label>
              <NumInput value={monthlyHoursWorked} onChange={setMonthlyHoursWorked} placeholder="160" />
            </div>
            <div className="text-right">
              <p className="text-xs text-rose-400">Overhead/peça</p>
              <p className="text-sm font-bold text-rose-700">{brl(totals.overheadCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Profit & Tax ─────────────────────────────────────────────── */}
      <Card className="border-rose-100 dark:border-rose-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900 dark:text-white">
            Lucro e impostos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                Margem de lucro (%)
              </label>
              <NumInput
                value={profitMarginPercent}
                onChange={setProfitMarginPercent}
                placeholder="30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-700 dark:text-rose-300">
                Impostos (%)
              </label>
              <NumInput
                value={taxPercent}
                onChange={setTaxPercent}
                placeholder="0"
              />
              <p className="mt-1 text-xs text-rose-400">MEI, Simples, etc.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Alerts ───────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <AlertBox key={i} alert={a} />
          ))}
        </div>
      )}

      {/* ── Result: Scenario Tabs ────────────────────────────────────── */}
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/10 dark:border-rose-900/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-rose-900 dark:text-white">
            Resultado por canal de venda
          </CardTitle>
          <CardDescription>
            Custo base: {brl(totals.baseCost)} (materiais + mão de obra + overhead)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-rose-100/60 p-1 dark:bg-rose-900/20">
            {totals.scenarios.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  activeTab === i
                    ? "bg-white text-rose-700 shadow-sm dark:bg-gray-800 dark:text-rose-300"
                    : "text-rose-400 hover:text-rose-600"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Active scenario detail */}
          {totals.scenarios[activeTab] && (
            <div className="space-y-2">
              <Row label="Custo base" value={totals.baseCost} muted />
              {totals.scenarios[activeTab].feePercent > 0 && (
                <Row
                  label={`Taxa ${totals.scenarios[activeTab].name} (${totals.scenarios[activeTab].feePercent}%)`}
                  value={totals.scenarios[activeTab].fees}
                  muted
                />
              )}
              {taxPercent > 0 && (
                <Row
                  label={`Impostos (${taxPercent}%)`}
                  value={totals.scenarios[activeTab].tax}
                  muted
                />
              )}
              <Row
                label={`Lucro (${profitMarginPercent}%)`}
                value={totals.scenarios[activeTab].profit}
              />
              <div className="my-2 border-t border-rose-200 dark:border-rose-800" />

              {/* Price box */}
              <div className="flex items-center justify-between rounded-2xl bg-rose-600 px-5 py-4 dark:bg-rose-700">
                <div>
                  <p className="text-xs font-semibold text-rose-200">
                    PREÇO SUGERIDO — {totals.scenarios[activeTab].name}
                  </p>
                  <p className="text-xs text-rose-300">
                    Lucro: {brl(totals.scenarios[activeTab].profit)} ({totals.scenarios[activeTab].profitPercent.toFixed(1)}%)
                  </p>
                </div>
                <span className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {brl(totals.scenarios[activeTab].suggestedPrice)}
                </span>
              </div>

              {/* Minimum price */}
              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2.5 dark:bg-amber-950/20">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Preço mínimo (sem lucro)
                </span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {brl(totals.minimumPrice)}
                </span>
              </div>
            </div>
          )}

          {/* All scenarios comparison */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {totals.scenarios.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`rounded-xl border p-3 text-center transition-all ${
                  activeTab === i
                    ? "border-rose-300 bg-white shadow-sm dark:border-rose-700 dark:bg-gray-800"
                    : "border-rose-100 bg-white/50 hover:bg-white dark:border-rose-900/20"
                }`}
              >
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  {s.name}
                </p>
                <p className="font-heading text-lg font-bold text-rose-700 dark:text-rose-400">
                  {brl(s.suggestedPrice)}
                </p>
                <p className={`text-[10px] font-semibold ${
                  s.profit >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {s.profit >= 0 ? "+" : ""}{brl(s.profit)}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Save ─────────────────────────────────────────────────────── */}
      <Button
        onClick={onSubmit}
        disabled={saving}
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

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-0.5 ${muted ? "text-rose-400 dark:text-rose-500" : "text-rose-800 dark:text-rose-200"}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm font-medium tabular-nums">{brl(value)}</span>
    </div>
  );
}

function AlertBox({ alert }: { alert: PricingAlert }) {
  const config = {
    danger: {
      bg: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40",
      text: "text-red-700 dark:text-red-400",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40",
      text: "text-amber-700 dark:text-amber-400",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40",
      text: "text-blue-700 dark:text-blue-400",
      icon: <Info className="h-4 w-4 text-blue-500" />,
    },
  }[alert.type];

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3 ${config.bg}`}>
      <span className="mt-0.5 shrink-0">{config.icon}</span>
      <p className={`text-sm ${config.text}`}>{alert.message}</p>
    </div>
  );
}
