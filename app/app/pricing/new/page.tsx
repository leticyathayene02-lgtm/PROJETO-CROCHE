"use client";

import { useState, useMemo } from "react";
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

import { createPricingCalculation } from "../actions";
import {
  computePricingTotals,
  getPricingAlerts,
  type PricingInputs,
  type PricingAlert,
  type ProfitMode,
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
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
  step?: string;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      min={0}
      step={step ?? "any"}
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
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);

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
  const [embalagem, setEmbalagem] = useState<number>(prefill?.embalagem ?? 0);
  const [etiqueta, setEtiqueta] = useState<number>(prefill?.etiqueta ?? 0);
  const [mimo, setMimo] = useState<number>(prefill?.mimo ?? 0);

  const [horas, setHoras] = useState<number>(prefill?.horas ?? 0);
  const [valorHora, setValorHora] = useState<number>(prefill?.valorHora ?? 0);

  const [taxaCartao, setTaxaCartao] = useState<number>(prefill?.taxaCartao ?? 0);
  const [impostoMarketplace, setImpostoMarketplace] = useState<number>(prefill?.impostoMarketplace ?? 0);

  const [profitMode, setProfitMode] = useState<ProfitMode>(prefill?.profitMode ?? "percent");
  const [margemPercent, setMargemPercent] = useState<number>(prefill?.margemPercent ?? 30);
  const [lucroFixo, setLucroFixo] = useState<number>(prefill?.lucroFixo ?? 0);

  // Compute em tempo real
  const inputs: PricingInputs = useMemo(
    () => ({
      material, embalagem, etiqueta, mimo,
      horas, valorHora,
      taxaCartao, impostoMarketplace,
      profitMode, margemPercent, lucroFixo,
      name,
    }),
    [material, embalagem, etiqueta, mimo, horas, valorHora, taxaCartao, impostoMarketplace, profitMode, margemPercent, lucroFixo, name]
  );

  const totals = useMemo(() => computePricingTotals(inputs), [inputs]);
  const alerts = useMemo(() => getPricingAlerts(inputs, totals), [inputs, totals]);

  // Submit
  async function onSubmit() {
    setSaving(true);
    const result = await createPricingCalculation({
      name,
      material, embalagem, etiqueta, mimo,
      horas, valorHora,
      taxaCartao, impostoMarketplace,
      profitMode, margemPercent, lucroFixo,
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
          className="mb-3 inline-flex items-center gap-1 text-sm text-rose-400 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao histórico
        </Link>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-rose-900">
          Calculadora de Preços
        </h1>
        <p className="mt-1 text-sm text-rose-500">
          Descubra o preço ideal da sua peça
        </p>
      </div>

      {/* Nome */}
      <Card className="border-rose-100">
        <CardContent className="pt-5">
          <label className="mb-1.5 block text-sm font-medium text-rose-700">
            Nome da peça (opcional)
          </label>
          <Input
            placeholder="Ex.: Amigurumi urso GG"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-rose-200 bg-white focus-visible:ring-rose-400"
          />
        </CardContent>
      </Card>

      {/* ── Card: Custos ──────────────────────────────────────────────── */}
      <Card className="border-rose-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900">
            💰 Custos de Material
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-rose-700">
              Custo de material (R$) *
            </label>
            <NumInput value={material} onChange={setMaterial} placeholder="0.00" />
            <p className="mt-1 text-xs text-rose-400">
              Total que você gastou de fio, linha, etc.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-rose-600">
                Embalagem
              </label>
              <NumInput value={embalagem} onChange={setEmbalagem} placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-rose-600">
                Etiqueta
              </label>
              <NumInput value={etiqueta} onChange={setEtiqueta} placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-rose-600">
                Mimo
              </label>
              <NumInput value={mimo} onChange={setMimo} placeholder="0" />
            </div>
          </div>
          {totals.materialTotal > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2">
              <span className="text-xs font-medium text-rose-600">Total materiais</span>
              <span className="text-sm font-bold text-rose-700">{brl(totals.materialTotal)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card: Tempo ───────────────────────────────────────────────── */}
      <Card className="border-rose-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900">
            ⏱️ Tempo de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">
                Horas gastas
              </label>
              <NumInput value={horas} onChange={setHoras} placeholder="0" step="0.5" />
              <p className="mt-1 text-xs text-rose-400">Aceita decimal (ex: 2.5)</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">
                Valor da hora (R$)
              </label>
              <NumInput value={valorHora} onChange={setValorHora} placeholder="25" />
            </div>
          </div>
          {totals.maoObra > 0 && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2">
              <span className="text-xs font-medium text-rose-600">Mão de obra</span>
              <span className="text-sm font-bold text-rose-700">{brl(totals.maoObra)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card: Taxas ───────────────────────────────────────────────── */}
      <Card className="border-rose-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900">
            📊 Taxas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">
                Taxa do cartão (%)
              </label>
              <NumInput value={taxaCartao} onChange={setTaxaCartao} placeholder="0" />
              <p className="mt-1 text-xs text-rose-400">Maquininha, gateway</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">
                Imposto / Marketplace (%)
              </label>
              <NumInput value={impostoMarketplace} onChange={setImpostoMarketplace} placeholder="0" />
              <p className="mt-1 text-xs text-rose-400">MEI, Elo7, Shopee...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card: Lucro ───────────────────────────────────────────────── */}
      <Card className="border-rose-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-rose-900">
            🎯 Lucro Desejado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Toggle */}
          <div className="flex rounded-xl bg-rose-100/60 p-1">
            <button
              type="button"
              onClick={() => setProfitMode("percent")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                profitMode === "percent"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-rose-400 hover:text-rose-600"
              }`}
            >
              % sobre custo
            </button>
            <button
              type="button"
              onClick={() => setProfitMode("fixed")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                profitMode === "fixed"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-rose-400 hover:text-rose-600"
              }`}
            >
              Valor fixo (R$)
            </button>
          </div>

          {profitMode === "percent" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">
                Margem de lucro (%)
              </label>
              <NumInput value={margemPercent} onChange={setMargemPercent} placeholder="30" />
              {totals.custoBase > 0 && (
                <p className="mt-1 text-xs text-rose-400">
                  = {brl(totals.lucroAlvo)} de lucro sobre {brl(totals.custoBase)} de custo
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-rose-700">
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
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-rose-900">
            Resultado
          </CardTitle>
          <p className="text-xs text-rose-500">
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
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 border border-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-amber-600">
                  Break-even PIX
                </p>
                <p className="text-sm font-bold text-amber-700">
                  {brl(totals.breakevenPix)}
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 border border-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-amber-600">
                  Break-even Cartão
                </p>
                <p className="text-sm font-bold text-amber-700">
                  {totals.taxaError ? "—" : brl(totals.breakevenCartao)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Resumo detalhado ── */}
          <div className="space-y-1 rounded-xl bg-white/80 p-3 text-sm">
            <Row label="Material total" value={totals.materialTotal} />
            <Row label="Mão de obra" value={totals.maoObra} />
            <div className="my-1.5 border-t border-rose-100" />
            <Row label="Custo base" value={totals.custoBase} bold />
            <Row label="Lucro alvo" value={totals.lucroAlvo} />
            <div className="my-1.5 border-t border-rose-100" />
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
      <span className={`${bold ? "font-semibold" : ""} ${accent ? "text-rose-700" : "text-rose-600"}`}>
        {label}
      </span>
      <span className={`tabular-nums ${bold ? "font-bold" : "font-medium"} ${accent ? "text-rose-700" : "text-rose-600"}`}>
        {brl(value)}
      </span>
    </div>
  );
}

function AlertBox({ alert }: { alert: PricingAlert }) {
  const config = {
    danger: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
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
