// Pricing calculation logic — shared between client and server
// Keep in sync with PRD formula

export interface PricingInputs {
  yarnCostPerGram: number;
  yarnGramsUsed: number;
  packaging: number;
  gift: number;
  labels: number;
  hoursSpent: number;
  hourlyRate: number;
  cardFeePercent: number;
  profitMarginPercent: number;
}

export interface PricingTotals {
  yarnCost: number;
  materialsCost: number;
  laborCost: number;
  subtotal: number;
  fees: number;
  profit: number;
  suggestedPrice: number;
}

export function computePricingTotals(data: PricingInputs): PricingTotals {
  const yarnCost = (data.yarnCostPerGram ?? 0) * (data.yarnGramsUsed ?? 0);
  const materialsCost =
    yarnCost +
    (data.packaging ?? 0) +
    (data.gift ?? 0) +
    (data.labels ?? 0);
  const laborCost = (data.hoursSpent ?? 0) * (data.hourlyRate ?? 0);
  const subtotal = materialsCost + laborCost;
  const fees = subtotal * ((data.cardFeePercent ?? 0) / 100);
  const profit = (subtotal + fees) * ((data.profitMarginPercent ?? 0) / 100);
  const suggestedPrice = subtotal + fees + profit;

  return {
    yarnCost,
    materialsCost,
    laborCost,
    subtotal,
    fees,
    profit,
    suggestedPrice,
  };
}
