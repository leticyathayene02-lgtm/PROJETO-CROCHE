import { TrendingUp, Timer } from "lucide-react";
import type { OrderTimeSummary } from "@/lib/time/types";

type Props = {
  summary: OrderTimeSummary;
  orderAmount: number;
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

const STAGE_COLORS: Record<string, { bg: string; bar: string }> = {
  production: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    bar: "bg-rose-500 dark:bg-rose-400",
  },
  finishing: {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    bar: "bg-violet-500 dark:bg-violet-400",
  },
  packaging: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    bar: "bg-amber-500 dark:bg-amber-400",
  },
  other: {
    bg: "bg-gray-100 dark:bg-gray-800/50",
    bar: "bg-gray-400 dark:bg-gray-500",
  },
};

function getHourlyRateColor(rate: number): string {
  if (rate >= 20) return "text-green-600 dark:text-green-400";
  if (rate >= 10) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getHourlyRateBg(rate: number): string {
  if (rate >= 20) return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/40";
  if (rate >= 10) return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40";
  return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/40";
}

export function TimeSummary({ summary, orderAmount }: Props) {
  const { totalMinutes, stages } = summary;

  if (totalMinutes === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-white/3">
        <div className="mb-3 flex items-center gap-2">
          <Timer className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
            Tempo investido
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhum tempo registrado. Use o cronômetro acima!
        </p>
      </div>
    );
  }

  const totalHours = totalMinutes / 60;
  const hourlyRate = orderAmount / totalHours;
  const maxMinutes = Math.max(...stages.map((s) => s.minutes));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-white/3">
      <div className="mb-4 flex items-center gap-2">
        <Timer className="h-4 w-4 text-rose-500" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          Tempo investido
        </h3>
      </div>

      {/* Total time */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="font-heading text-3xl font-bold text-gray-900 dark:text-white">
          {formatDuration(totalMinutes)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          no total
        </span>
      </div>

      {/* Hourly rate */}
      <div
        className={`mb-4 rounded-xl border p-3 ${getHourlyRateBg(hourlyRate)}`}
      >
        <div className="flex items-center gap-2">
          <TrendingUp className={`h-4 w-4 ${getHourlyRateColor(hourlyRate)}`} />
          <span className={`text-sm font-semibold ${getHourlyRateColor(hourlyRate)}`}>
            Você está ganhando R$ {hourlyRate.toFixed(2).replace(".", ",")}/hora
            nesta peça
          </span>
        </div>
      </div>

      {/* Stage breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Por etapa
        </h4>
        {stages.map((s) => {
          const colors = STAGE_COLORS[s.stage] ?? STAGE_COLORS.other;
          const pct = maxMinutes > 0 ? (s.minutes / maxMinutes) * 100 : 0;
          return (
            <div key={s.stage}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.label}
                </span>
                <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
                  {formatDuration(s.minutes)}
                </span>
              </div>
              <div
                className={`h-2.5 w-full overflow-hidden rounded-full ${colors.bg}`}
              >
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
