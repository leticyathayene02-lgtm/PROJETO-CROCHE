"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const QUESTIONS = [
  {
    q: "É realmente gratuito?",
    a: "Sim! O plano gratuito inclui 3 cálculos de preço e 5 transações financeiras por mês — perfeito para experimentar. Sem cartão de crédito e sem tempo limite.",
  },
  {
    q: "Preciso instalar alguma coisa?",
    a: "Não. O Trama Pro funciona direto no navegador, em qualquer dispositivo. Funciona perfeitamente no celular, no tablet e no computador.",
  },
  {
    q: "Como funciona a calculadora de preço?",
    a: "Você informa o custo do fio (R$/grama), gramas usadas, horas trabalhadas, embalagem e a margem de lucro desejada. O sistema calcula automaticamente o preço ideal, já considerando taxa de maquininha e todos os custos.",
  },
  {
    q: "Posso cancelar o plano Premium quando quiser?",
    a: "Sim, sem fidelidade. Se cancelar, você continua com acesso ao plano gratuito. Todos os seus dados ficam salvos — nada é perdido.",
  },
  {
    q: "Funciona para outros tipos de artesanato?",
    a: "Sim! Embora seja feito com carinho para artesãs, funciona ótimo para tricô, macramê, bordado, amigurumi, bijuteria e qualquer artesanato que envolva materiais, horas de trabalho e margem de lucro.",
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {QUESTIONS.map((item, i) => (
        <div
          key={i}
          className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
            open === i
              ? "border-rose-200 bg-rose-50/50 dark:border-rose-800/50 dark:bg-rose-950/20"
              : "border-gray-100 bg-white/60 hover:border-rose-100 dark:border-white/8 dark:bg-white/3 dark:hover:border-white/12"
          } backdrop-blur-sm`}
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
            aria-expanded={open === i}
          >
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.q}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-rose-500 transition-transform duration-300 dark:text-rose-400 ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              open === i ? "max-h-48" : "max-h-0"
            }`}
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {item.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
