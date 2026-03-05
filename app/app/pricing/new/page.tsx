"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  pricingSchema,
  type PricingFormValues,
  createPricingCalculation,
} from "../actions";
import { computePricingTotals } from "@/lib/pricing";

// ─────────────────────────────────────────
// Currency formatter
// ─────────────────────────────────────────
const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(isNaN(value) ? 0 : value);

// ─────────────────────────────────────────
// Field definition helper
// ─────────────────────────────────────────
interface FieldDef {
  name: keyof PricingFormValues;
  label: string;
  placeholder: string;
  hint?: string;
}

const MATERIAL_FIELDS: FieldDef[] = [
  {
    name: "yarnCostPerGram",
    label: "Custo do fio por grama (R$)",
    placeholder: "0,00",
    hint: "Ex.: se o novelo custa R$ 12 e tem 100g → 0,12",
  },
  {
    name: "yarnGramsUsed",
    label: "Fio utilizado (gramas)",
    placeholder: "0",
    hint: "Quantidade de fio consumida na peça",
  },
  {
    name: "packaging",
    label: "Embalagem (R$)",
    placeholder: "0,00",
    hint: "Sacola, caixa, papel de seda etc.",
  },
  {
    name: "gift",
    label: "Mimo / brinde (R$)",
    placeholder: "0,00",
    hint: "Cartão, adesivo ou brinde incluído",
  },
  {
    name: "labels",
    label: "Etiquetas e acessórios (R$)",
    placeholder: "0,00",
    hint: "Tags, fivelas, botões etc.",
  },
];

const LABOR_FIELDS: FieldDef[] = [
  {
    name: "hoursSpent",
    label: "Horas trabalhadas",
    placeholder: "0",
    hint: "Tempo total dedicado à peça",
  },
  {
    name: "hourlyRate",
    label: "Valor da sua hora (R$/h)",
    placeholder: "0,00",
    hint: "Quanto você quer receber por hora",
  },
];

const PRICING_FIELDS: FieldDef[] = [
  {
    name: "cardFeePercent",
    label: "Taxa da maquininha (%)",
    placeholder: "0",
    hint: "Taxa cobrada na venda com cartão (ex.: 2,5)",
  },
  {
    name: "profitMarginPercent",
    label: "Margem de lucro desejada (%)",
    placeholder: "0",
    hint: "Percentual de lucro sobre o custo total (ex.: 30)",
  },
];

// ─────────────────────────────────────────
// Breakdown row component
// ─────────────────────────────────────────
function BreakdownRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1 ${muted ? "text-rose-400" : "text-rose-800"}`}
    >
      <span className="text-sm">{label}</span>
      <span className="text-sm font-medium tabular-nums">{brl(value)}</span>
    </div>
  );
}

// ─────────────────────────────────────────
// Number input helper (handles comma decimal)
// ─────────────────────────────────────────
function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  placeholder: string;
}) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      min={0}
      step="any"
      placeholder={placeholder}
      value={value === undefined || isNaN(value as number) ? "" : value}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        onChange(isNaN(parsed) ? 0 : parsed);
      }}
      className="border-rose-200 bg-white focus-visible:ring-rose-400"
    />
  );
}

// ─────────────────────────────────────────
// Main page
// ─────────────────────────────────────────
export default function NewPricingPage() {
  const router = useRouter();

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      name: "",
      yarnCostPerGram: 0,
      yarnGramsUsed: 0,
      packaging: 0,
      gift: 0,
      labels: 0,
      hoursSpent: 0,
      hourlyRate: 0,
      cardFeePercent: 0,
      profitMarginPercent: 0,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  // Live values for breakdown
  const watched = useWatch({ control });

  const totals = computePricingTotals({
    yarnCostPerGram: watched.yarnCostPerGram ?? 0,
    yarnGramsUsed: watched.yarnGramsUsed ?? 0,
    packaging: watched.packaging ?? 0,
    gift: watched.gift ?? 0,
    labels: watched.labels ?? 0,
    hoursSpent: watched.hoursSpent ?? 0,
    hourlyRate: watched.hourlyRate ?? 0,
    cardFeePercent: watched.cardFeePercent ?? 0,
    profitMarginPercent: watched.profitMarginPercent ?? 0,
  });

  async function onSubmit(values: PricingFormValues) {
    const result = await createPricingCalculation(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Cálculo salvo com sucesso!");
    router.push("/app/pricing");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/app/pricing"
          className="mb-3 inline-flex items-center gap-1 text-sm text-rose-400 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao histórico
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-rose-900">
          Nova calculadora
        </h1>
        <p className="mt-1 text-sm text-rose-500">
          Calcule o preço ideal para a sua peça de crochê
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <Card className="border-rose-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-rose-900">
                Identificação (opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-rose-700">
                      Nome do cálculo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex.: Bolsa de palha tamanho M"
                        {...field}
                        className="border-rose-200 bg-white focus-visible:ring-rose-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Materials */}
          <Card className="border-rose-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-rose-900">
                Materiais
              </CardTitle>
              <CardDescription className="text-rose-400">
                Custos de insumos utilizados na peça
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MATERIAL_FIELDS.map((f) => (
                <FormField
                  key={f.name}
                  control={control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-700">{f.label}</FormLabel>
                      <FormControl>
                        <NumberInput
                          value={field.value as number}
                          onChange={field.onChange}
                          placeholder={f.placeholder}
                        />
                      </FormControl>
                      {f.hint && (
                        <p className="text-xs text-rose-400">{f.hint}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          {/* Labor */}
          <Card className="border-rose-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-rose-900">
                Mão de obra
              </CardTitle>
              <CardDescription className="text-rose-400">
                Quanto vale o seu tempo?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {LABOR_FIELDS.map((f) => (
                <FormField
                  key={f.name}
                  control={control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-700">{f.label}</FormLabel>
                      <FormControl>
                        <NumberInput
                          value={field.value as number}
                          onChange={field.onChange}
                          placeholder={f.placeholder}
                        />
                      </FormControl>
                      {f.hint && (
                        <p className="text-xs text-rose-400">{f.hint}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          {/* Pricing strategy */}
          <Card className="border-rose-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-rose-900">
                Estratégia de preço
              </CardTitle>
              <CardDescription className="text-rose-400">
                Taxas e margem de lucro desejada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PRICING_FIELDS.map((f) => (
                <FormField
                  key={f.name}
                  control={control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-700">{f.label}</FormLabel>
                      <FormControl>
                        <NumberInput
                          value={field.value as number}
                          onChange={field.onChange}
                          placeholder={f.placeholder}
                        />
                      </FormControl>
                      {f.hint && (
                        <p className="text-xs text-rose-400">{f.hint}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          {/* Live breakdown */}
          <Card className="border-rose-200 bg-rose-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-rose-900">
                Resumo do cálculo
              </CardTitle>
              <CardDescription className="text-rose-400">
                Atualizado em tempo real conforme você preenche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-rose-100">
                <div className="pb-3 space-y-0.5">
                  <BreakdownRow
                    label="Custo do fio"
                    value={totals.yarnCost}
                    muted
                  />
                  <BreakdownRow
                    label="Total de materiais"
                    value={totals.materialsCost}
                  />
                  <BreakdownRow
                    label="Mão de obra"
                    value={totals.laborCost}
                  />
                </div>
                <div className="py-3 space-y-0.5">
                  <BreakdownRow
                    label="Subtotal"
                    value={totals.subtotal}
                  />
                  <BreakdownRow
                    label="Taxas (maquininha)"
                    value={totals.fees}
                    muted
                  />
                  <BreakdownRow
                    label="Lucro"
                    value={totals.profit}
                    muted
                  />
                </div>
                <div className="pt-4">
                  <div className="flex items-center justify-between rounded-xl bg-rose-600 px-4 py-3">
                    <span className="text-sm font-semibold text-rose-100">
                      PREÇO SUGERIDO
                    </span>
                    <span className="text-xl font-extrabold tracking-tight text-white tabular-nums">
                      {brl(totals.suggestedPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar cálculo"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
