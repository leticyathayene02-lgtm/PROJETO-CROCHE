"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  month: string;
  entradas: number;
  saidas: number;
  lucro: number;
}

interface FinanceChartProps {
  data: ChartDataPoint[];
}

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-rose-100 rounded-lg shadow-md p-3 text-xs space-y-1">
      <p className="font-semibold text-rose-900 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-medium text-slate-800">{brl(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function FinanceChart({ data }: FinanceChartProps) {
  if (data.every((d) => d.entradas === 0 && d.saidas === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-rose-300 text-sm">
        Sem dados para exibir no período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#9f6375" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9f6375" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat("pt-BR", {
              notation: "compact",
              compactDisplay: "short",
              currency: "BRL",
              style: "currency",
            }).format(v)
          }
          width={60}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#fdf2f8" }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#9f6375" }}
          iconType="square"
          iconSize={10}
        />
        <Bar dataKey="entradas" name="Entradas" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="saidas" name="Saídas" fill="#fda4af" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="lucro" name="Lucro" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
