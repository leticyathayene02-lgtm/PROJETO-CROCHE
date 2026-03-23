"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import Link from "next/link";

function AguardandoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentUrl = searchParams.get("url") ?? "";

  const [checking, startChecking] = useTransition();
  const [notYet, setNotYet] = useState(false);

  function handleVerify() {
    setNotYet(false);
    startChecking(async () => {
      const res = await fetch("/api/subscriptions/status");
      if (res.ok) {
        const data = await res.json();
        if (data.plan === "PREMIUM") {
          router.push("/app/settings/billing?success=1");
          return;
        }
      }
      setNotYet(true);
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl dark:border-white/10 dark:bg-[oklch(0.18_0.01_280)]/90">
        <div className="mb-4 flex justify-center">
          <span className="text-5xl">🧾</span>
        </div>

        <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Pagamento aguardando confirmação
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Seu boleto/PIX foi gerado. Após realizar o pagamento, clique em
          <strong> &ldquo;Já paguei&rdquo;</strong> para verificar. A confirmação pode
          levar alguns minutos.
        </p>

        {paymentUrl && (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
          >
            Abrir boleto / PIX
          </a>
        )}

        <button
          onClick={handleVerify}
          disabled={checking}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/8"
        >
          {checking ? "Verificando..." : "Já paguei — verificar status"}
        </button>

        {notYet && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            Pagamento ainda não confirmado. Aguarde alguns minutos e tente novamente.
          </p>
        )}

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          Dúvidas?{" "}
          <Link
            href="/app/settings/billing"
            className="underline hover:text-rose-500 dark:hover:text-rose-400"
          >
            Voltar para assinatura
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AguardandoPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-gray-500">Carregando...</p>}>
        <AguardandoContent />
      </Suspense>
    </div>
  );
}
