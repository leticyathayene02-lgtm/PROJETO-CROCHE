"use client";

import { Lock, Shield, Zap, BarChart3, Package } from "lucide-react";
import Link from "next/link";
import { PlanCard3D } from "@/components/plan-card-3d";

interface PaywallScreenProps {
  status: "TRIAL_EXPIRED" | "BLOCKED";
  userEmail: string;
}

const benefits = [
  {
    icon: Zap,
    title: "Precificação ilimitada",
    description: "Calcule o preço justo de todas as suas peças sem limite.",
  },
  {
    icon: BarChart3,
    title: "Financeiro e metas",
    description: "Controle receitas, despesas e acompanhe suas metas mensais.",
  },
  {
    icon: Package,
    title: "Estoque e materiais",
    description: "Gerencie fios, insumos e estoque de produtos acabados.",
  },
  {
    icon: Shield,
    title: "Dados sempre seguros",
    description: "Tudo salvo e protegido — retome de onde parou ao assinar.",
  },
];

export function PaywallScreen({ status, userEmail }: PaywallScreenProps) {
  const isExpired = status === "TRIAL_EXPIRED";

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -left-40 h-96 w-96 rounded-full bg-rose-900/20 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-20 right-0 h-80 w-80 rounded-full bg-rose-800/15 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-rose-950/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center py-8">
        <span className="font-heading text-2xl font-bold text-white">
          Trama <span className="text-rose-500">Pro</span>
        </span>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="mx-auto w-full max-w-4xl">
          {/* Lock icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-800/40 bg-rose-950/60 backdrop-blur-sm">
              <Lock className="h-8 w-8 text-rose-400" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-10 text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              {isExpired
                ? "Seu período de teste encerrou"
                : "Acesso suspenso"}
            </h1>
            <p className="mt-3 text-base text-gray-400 sm:text-lg">
              Seus dados estão salvos e seguros.{" "}
              <span className="text-gray-300">
                Assine para continuar de onde parou.
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600">{userEmail}</p>
          </div>

          {/* Two-column layout: benefits + card */}
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
            {/* Benefits list */}
            <div className="w-full max-w-sm space-y-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-800/30 bg-rose-950/50">
                    <b.icon className="h-5 w-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Card */}
            <div className="flex flex-col items-center gap-6">
              <PlanCard3D />

              {/* CTA Button */}
              <Link
                href="/app/settings/billing"
                className="w-80 rounded-xl bg-rose-600 px-6 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:bg-rose-500 hover:shadow-rose-500/25 hover:shadow-xl active:scale-95"
              >
                Assinar agora — R$ 19,90/mês
              </Link>

              <p className="text-center text-xs text-gray-600">
                Acesso imediato após confirmação do pagamento
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with logout */}
      <footer className="relative z-10 py-6 text-center">
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-700 hover:text-gray-500 transition-colors"
        >
          Sair da conta ({userEmail})
        </button>
      </footer>
    </div>
  );
}
