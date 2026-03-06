"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Clock } from "lucide-react";
import { saveTimeEntry } from "@/lib/time/actions";

const STAGES = [
  { value: "production", label: "Produção" },
  { value: "finishing", label: "Acabamento" },
  { value: "packaging", label: "Embalagem" },
  { value: "other", label: "Outros" },
];

type Props = {
  orderId?: string;
  productId?: string;
  label?: string;
};

export function TimerWidget({ orderId, productId, label }: Props) {
  const [stage, setStage] = useState("production");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [saved, setSaved] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function formatTime(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  async function handleStop() {
    setRunning(false);
    if (elapsed < 10) { setElapsed(0); return; }
    const minutes = Math.max(1, Math.round(elapsed / 60));
    setSaving(true);
    try {
      await saveTimeEntry({ orderId, productId, stage, minutes });
      setSaved(minutes);
      setElapsed(0);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/3">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-rose-500" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          {label ?? "Cronômetro"}
        </h3>
      </div>

      {/* Stage */}
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        disabled={running}
        className="mb-3 w-full rounded-xl border border-rose-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
      >
        {STAGES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Timer display */}
      <div className="mb-3 text-center">
        <span className={`font-heading text-4xl font-bold tabular-nums tracking-tight ${running ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-200"}`}>
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={saving}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
            running
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-rose-600 text-white hover:bg-rose-700"
          } disabled:opacity-60`}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pausar" : elapsed > 0 ? "Continuar" : "Iniciar"}
        </button>

        {(elapsed > 0 || saving) && (
          <button
            onClick={handleStop}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 disabled:opacity-60"
          >
            <Square className="h-4 w-4" />
            {saving ? "Salvando..." : "Parar e salvar"}
          </button>
        )}
      </div>

      {saved !== null && (
        <p className="mt-2 text-center text-xs font-medium text-green-600 dark:text-green-400">
          {saved} min registrado{saved !== 1 ? "s" : ""}!
        </p>
      )}
    </div>
  );
}
