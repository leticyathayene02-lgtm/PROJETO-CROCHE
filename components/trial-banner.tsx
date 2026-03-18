"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";
import Link from "next/link";

interface TrialBannerProps {
  daysLeft: number;
  hoursLeft: number;
}

export function TrialBanner({ daysLeft, hoursLeft }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isUrgent = hoursLeft < 24;
  const isLastDay = daysLeft === 1 && !isUrgent;

  let message: string;
  if (isUrgent) {
    message = `Faltam ${hoursLeft} hora${hoursLeft !== 1 ? "s" : ""} para o fim do seu teste grátis.`;
  } else if (isLastDay) {
    message = "Seu teste acaba amanhã. Assine para não perder o acesso.";
  } else {
    message = `Você está no teste grátis — restam ${daysLeft} dias.`;
  }

  return (
    <div
      className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium ${
        isUrgent || isLastDay
          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white"
          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
      }`}
      style={{ minHeight: 44 }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="h-4 w-4 shrink-0" />
        <span className="truncate">{message}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/app/settings/billing"
          className="rounded-md bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 transition-colors whitespace-nowrap"
        >
          Assinar agora
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso de trial"
          className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
