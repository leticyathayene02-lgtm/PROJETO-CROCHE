// ─────────────────────────────────────────────────────────────────────
// Calculadora de Precificação — Trama Pro
// Simples e poderosa: PIX vs Cartão, lucro % ou R$, break-even
// ─────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────

export type ProfitMode = "percent" | "fixed";

export interface SelectedMaterialItem {
  materialId: string;
  name: string;
  unit: string;
  costPerUnit: number;
  quantity: number;
  cost: number;
}

export interface PricingInputs {
  // Materiais
  material: number;       // custo manual da linha/fio principal (R$)
  embalagem: number;      // embalagem (legado / compat)
  mimo: number;           // mimo / brinde (legado / compat)
  acessorios: number;     // acessórios de acabamento (legado / compat)
  grafica: number;        // gráfica (legado / compat)
  /** Soma dos materiais complementares do catálogo */
  complementares?: number;
  /** Materiais complementares selecionados do catálogo (detalhe) */
  selectedMaterials?: SelectedMaterialItem[];
  /** @deprecated mantido para compatibilidade com cálculos antigos */
  etiqueta?: number;

  // Tempo
  horas: number;          // horas gastas (decimal)
  valorHora: number;      // R$/hora

  // Taxas
  taxaCartao: number;     // % da maquininha (default 0)
  impostoMarketplace: number; // % imposto/marketplace (default 0)

  // Lucro
  profitMode: ProfitMode;
  margemPercent: number;  // usado quando profitMode = "percent"
  lucroFixo: number;      // usado quando profitMode = "fixed"

  // Meta (nome opcional)
  name?: string;
}

export interface PricingTotals {
  // Decomposição
  materialTotal: number;
  maoObra: number;
  custoBase: number;

  // Lucro alvo
  lucroAlvo: number;

  // PIX (sem taxa no recebimento)
  precoPix: number;
  lucroLiquidoPix: number;
  lucroPercentPix: number;
  breakevenPix: number;

  // Cartão (taxa incide sobre recebimento)
  taxaTotal: number;        // taxaCartao + impostoMarketplace em decimal
  precoCartao: number;
  lucroLiquidoCartao: number;
  lucroPercentCartao: number;
  breakevenCartao: number;

  // Erro de taxa alta
  taxaError: string | null;

  // Legacy compat (para cálculos antigos salvos)
  suggestedPrice: number;
  baseCost: number;
}

// ─── Compute ─────────────────────────────────────────────────────────

export function computePricingTotals(data: PricingInputs): PricingTotals {
  // --- Material total ---
  // material = custo manual da linha/fio principal
  // complementares = soma dos materiais do catálogo (novo fluxo)
  // embalagem/mimo/acessorios/grafica/etiqueta = compat com cálculos antigos
  const materialTotal = round2(
    (data.material || 0) +
    (data.complementares || 0) +
    (data.embalagem || 0) +
    (data.mimo || 0) +
    (data.acessorios || 0) +
    (data.grafica || 0) +
    (data.etiqueta || 0)
  );

  // --- Mão de obra ---
  const maoObra = round2((data.horas || 0) * (data.valorHora || 0));

  // --- Custo base ---
  const custoBase = round2(materialTotal + maoObra);

  // --- Lucro alvo ---
  let lucroAlvo: number;
  if (data.profitMode === "fixed") {
    lucroAlvo = data.lucroFixo || 0;
  } else {
    lucroAlvo = round2(custoBase * ((data.margemPercent || 0) / 100));
  }

  // --- Taxa total (cartão + imposto/marketplace) ---
  const taxaCartaoDecimal = (data.taxaCartao || 0) / 100;
  const impostoDecimal = (data.impostoMarketplace || 0) / 100;
  const taxaTotal = taxaCartaoDecimal + impostoDecimal;

  // --- Validar taxa ---
  let taxaError: string | null = null;
  if (taxaTotal >= 0.99) {
    taxaError = "Taxa alta demais! A soma de taxas não pode ser 99% ou mais.";
  }

  // --- Preço PIX (sem taxa no recebimento) ---
  const precoPix = round2(custoBase + lucroAlvo);

  // --- Preço Cartão (taxa incide sobre recebimento) ---
  // precoCartao = (custoBase + lucroAlvo) / (1 - taxaTotal)
  let precoCartao: number;
  if (taxaTotal >= 0.99) {
    precoCartao = 0;
  } else {
    precoCartao = round2((custoBase + lucroAlvo) / (1 - taxaTotal));
  }

  // --- Lucro líquido real ---
  const lucroLiquidoPix = round2(precoPix - custoBase);
  const lucroLiquidoCartao = taxaTotal >= 0.99
    ? 0
    : round2(precoCartao * (1 - taxaTotal) - custoBase);

  // --- Lucro % sobre preço ---
  const lucroPercentPix = precoPix > 0
    ? round2((lucroLiquidoPix / precoPix) * 100)
    : 0;
  const lucroPercentCartao = precoCartao > 0
    ? round2((lucroLiquidoCartao / precoCartao) * 100)
    : 0;

  // --- Break-even ---
  const breakevenPix = custoBase;
  const breakevenCartao = taxaTotal >= 0.99
    ? 0
    : round2(custoBase / (1 - taxaTotal));

  return {
    materialTotal,
    maoObra,
    custoBase,
    lucroAlvo,
    precoPix,
    lucroLiquidoPix,
    lucroPercentPix,
    breakevenPix,
    taxaTotal,
    precoCartao,
    lucroLiquidoCartao,
    lucroPercentCartao,
    breakevenCartao,
    taxaError,
    // Legacy compat
    suggestedPrice: precoPix,
    baseCost: custoBase,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Alerts ──────────────────────────────────────────────────────────

export interface PricingAlert {
  type: "danger" | "warning" | "info";
  message: string;
}

export function getPricingAlerts(
  inputs: PricingInputs,
  totals: PricingTotals
): PricingAlert[] {
  const alerts: PricingAlert[] = [];

  if (totals.taxaError) {
    alerts.push({ type: "danger", message: totals.taxaError });
  }

  // Prejuízo
  if (totals.lucroLiquidoPix < 0) {
    alerts.push({
      type: "danger",
      message: "Prejuízo! Você está pagando para trabalhar nesta peça.",
    });
  }

  // Margem muito baixa
  if (totals.lucroPercentPix >= 0 && totals.lucroPercentPix < 15 && totals.precoPix > 0) {
    alerts.push({
      type: "warning",
      message: `Margem de apenas ${totals.lucroPercentPix.toFixed(1)}%. Considere aumentar o preço.`,
    });
  }

  // Valor hora efetivo baixo
  if (inputs.horas > 0 && inputs.valorHora > 0 && inputs.valorHora < 15) {
    alerts.push({
      type: "warning",
      message: `Valor/hora de R$ ${inputs.valorHora.toFixed(2)} está abaixo do mínimo recomendado (R$ 15).`,
    });
  }

  // Sem mão de obra
  if (totals.maoObra === 0 && totals.materialTotal > 0) {
    alerts.push({
      type: "info",
      message: "Você não incluiu o custo do seu tempo. Lembre-se: seu trabalho tem valor!",
    });
  }

  return alerts;
}
