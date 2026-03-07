// ─────────────────────────────────────────────────────────────────────
// Professional Pricing Engine — Trama Pro
// Supports: multiple materials, labor stages, overhead, sales scenarios
// ─────────────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────────────

export interface MaterialItem {
  name: string;
  unit: string; // g, m, un, pct
  quantity: number;
  costPerUnit: number;
}

export interface LaborStage {
  name: string;
  minutes: number;
}

export interface OverheadItem {
  name: string;
  monthlyAmount: number;
}

export interface SalesScenario {
  name: string;
  feePercent: number;
}

export interface PricingInputs {
  // Materials
  materials: MaterialItem[];

  // Labor
  laborStages: LaborStage[];
  hourlyRate: number;

  // Overhead
  overheadItems: OverheadItem[];
  monthlyHoursWorked: number; // for rateio

  // Profit
  profitMarginPercent: number;

  // Tax (optional)
  taxPercent: number;

  // Scenarios
  scenarios: SalesScenario[];

  // Legacy compat (old form fields)
  yarnCostPerGram?: number;
  yarnGramsUsed?: number;
  packaging?: number;
  gift?: number;
  labels?: number;
  hoursSpent?: number;
  cardFeePercent?: number;
}

export interface ScenarioResult {
  name: string;
  feePercent: number;
  fees: number;
  tax: number;
  suggestedPrice: number;
  profit: number;
  profitPercent: number;
}

export interface PricingTotals {
  // Breakdown
  materialsCost: number;
  laborCost: number;
  totalMinutes: number;
  overheadCost: number;
  baseCost: number; // materials + labor + overhead

  // Scenarios
  scenarios: ScenarioResult[];

  // Best scenario (first one — "À vista")
  fees: number;
  tax: number;
  profit: number;
  suggestedPrice: number;
  minimumPrice: number; // break-even

  // Legacy compat
  yarnCost: number;
  subtotal: number;
}

// ─── Default scenarios ──────────────────────────────────────────────

export const DEFAULT_SCENARIOS: SalesScenario[] = [
  { name: "À vista / Pix", feePercent: 0 },
  { name: "Cartão", feePercent: 5 },
  { name: "Marketplace", feePercent: 12 },
  { name: "Atacado", feePercent: 0 },
];

// ─── Default overhead items ─────────────────────────────────────────

export const DEFAULT_OVERHEAD_ITEMS: OverheadItem[] = [
  { name: "Aluguel / espaço", monthlyAmount: 0 },
  { name: "Internet", monthlyAmount: 0 },
  { name: "Energia", monthlyAmount: 0 },
  { name: "Ferramentas / agulhas", monthlyAmount: 0 },
  { name: "Embalagens (fixo)", monthlyAmount: 0 },
];

// ─── Compute ────────────────────────────────────────────────────────

export function computePricingTotals(data: PricingInputs): PricingTotals {
  // --- Materials cost ---
  let materialsCost = 0;
  if (data.materials && data.materials.length > 0) {
    materialsCost = data.materials.reduce(
      (sum, m) => sum + (m.quantity || 0) * (m.costPerUnit || 0),
      0
    );
  } else {
    // Legacy fallback
    const yarnCost =
      (data.yarnCostPerGram ?? 0) * (data.yarnGramsUsed ?? 0);
    materialsCost =
      yarnCost +
      (data.packaging ?? 0) +
      (data.gift ?? 0) +
      (data.labels ?? 0);
  }

  // --- Labor cost ---
  let totalMinutes = 0;
  if (data.laborStages && data.laborStages.length > 0) {
    totalMinutes = data.laborStages.reduce(
      (sum, s) => sum + (s.minutes || 0),
      0
    );
  } else {
    totalMinutes = (data.hoursSpent ?? 0) * 60;
  }
  const hourlyRate = data.hourlyRate ?? 0;
  const laborCost = (totalMinutes / 60) * hourlyRate;

  // --- Overhead cost (rateio per hour) ---
  let overheadCost = 0;
  if (data.overheadItems && data.overheadItems.length > 0) {
    const totalMonthlyOverhead = data.overheadItems.reduce(
      (sum, o) => sum + (o.monthlyAmount || 0),
      0
    );
    const monthlyHours = data.monthlyHoursWorked || 160;
    const overheadPerHour = monthlyHours > 0 ? totalMonthlyOverhead / monthlyHours : 0;
    overheadCost = overheadPerHour * (totalMinutes / 60);
  }

  // --- Base cost ---
  const baseCost = materialsCost + laborCost + overheadCost;

  // --- Profit ---
  const profitMargin = (data.profitMarginPercent ?? 0) / 100;
  const taxPercent = (data.taxPercent ?? 0) / 100;

  // --- Scenarios ---
  const scenarioDefs =
    data.scenarios && data.scenarios.length > 0
      ? data.scenarios
      : data.cardFeePercent != null
        ? [{ name: "Cartão", feePercent: data.cardFeePercent }]
        : DEFAULT_SCENARIOS;

  const scenarios: ScenarioResult[] = scenarioDefs.map((s) => {
    const feeRate = (s.feePercent || 0) / 100;
    // Price = baseCost / (1 - feeRate - taxRate - profitRate)
    // This ensures fees/taxes/profit are calculated on final price, not cost
    const denominator = 1 - feeRate - taxPercent - profitMargin;
    const safeDenom = denominator > 0.01 ? denominator : 0.01;
    const price = baseCost / safeDenom;
    const fees = price * feeRate;
    const tax = price * taxPercent;
    const profit = price * profitMargin;
    const profitPercent = price > 0 ? (profit / price) * 100 : 0;

    return {
      name: s.name,
      feePercent: s.feePercent || 0,
      fees: round2(fees),
      tax: round2(tax),
      suggestedPrice: round2(price),
      profit: round2(profit),
      profitPercent: round2(profitPercent),
    };
  });

  // Primary scenario (first)
  const primary = scenarios[0] ?? {
    fees: 0,
    tax: 0,
    profit: 0,
    suggestedPrice: baseCost,
  };

  // Minimum price (break-even = baseCost with no profit)
  const minDenom = 1 - (scenarioDefs[0]?.feePercent || 0) / 100 - taxPercent;
  const minimumPrice = minDenom > 0.01 ? baseCost / minDenom : baseCost;

  return {
    materialsCost: round2(materialsCost),
    laborCost: round2(laborCost),
    totalMinutes,
    overheadCost: round2(overheadCost),
    baseCost: round2(baseCost),
    scenarios,
    fees: primary.fees,
    tax: primary.tax,
    profit: primary.profit,
    suggestedPrice: primary.suggestedPrice,
    minimumPrice: round2(minimumPrice),
    // Legacy compat
    yarnCost: round2(materialsCost),
    subtotal: round2(baseCost),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Alerts / Intelligence ──────────────────────────────────────────

export interface PricingAlert {
  type: "danger" | "warning" | "info";
  message: string;
}

export function getPricingAlerts(
  inputs: PricingInputs,
  totals: PricingTotals
): PricingAlert[] {
  const alerts: PricingAlert[] = [];

  // Paying to work
  if (totals.profit < 0) {
    alerts.push({
      type: "danger",
      message: "Prejuízo! Você está pagando para trabalhar neste produto.",
    });
  }

  // Very low margin
  if (totals.profit >= 0 && totals.suggestedPrice > 0) {
    const marginPct = (totals.profit / totals.suggestedPrice) * 100;
    if (marginPct < 15 && marginPct >= 0) {
      alerts.push({
        type: "warning",
        message: `Margem de apenas ${marginPct.toFixed(1)}%. Considere aumentar o preço ou reduzir custos.`,
      });
    }
  }

  // Hourly rate too low
  const effectiveHourlyRate =
    totals.totalMinutes > 0
      ? (totals.laborCost / totals.totalMinutes) * 60
      : 0;
  if (effectiveHourlyRate > 0 && effectiveHourlyRate < 15) {
    alerts.push({
      type: "warning",
      message: `Valor/hora efetivo de R$ ${effectiveHourlyRate.toFixed(2)} está abaixo do mínimo recomendado (R$ 15).`,
    });
  }

  // No labor cost
  if (totals.laborCost === 0 && totals.materialsCost > 0) {
    alerts.push({
      type: "info",
      message: "Você não incluiu o custo do seu tempo. Lembre-se: seu trabalho tem valor!",
    });
  }

  return alerts;
}
