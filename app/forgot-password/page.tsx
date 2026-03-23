"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Method = "email" | "whatsapp";
type WppStep = "phone" | "code";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("whatsapp");

  // Email flow
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // WhatsApp flow
  const [phone, setPhone] = useState("");
  const [wppStep, setWppStep] = useState<WppStep>("phone");
  const [code, setCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleMethodChange(m: Method) {
    setMethod(m);
    setError(null);
  }

  // ── Email submit ──────────────────────────────────────
  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro inesperado."); return; }
      setEmailSent(true);
    });
  }

  // ── WhatsApp: send OTP ────────────────────────────────
  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro inesperado."); return; }
      setWppStep("code");
    });
  }

  // ── WhatsApp: verify OTP ──────────────────────────────
  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Código inválido."); return; }
      router.push(`/reset-password?token=${data.token}`);
    });
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20";

  const btnPrimary =
    "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 px-4 dark:from-gray-950 dark:via-rose-950/20 dark:to-gray-950">
      <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl shadow-rose-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-[oklch(0.18_0.01_280)]/90">
        <div className="mb-6 text-center">
          <span className="text-3xl">🧶</span>
          <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            Recuperar senha
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Escolha como deseja receber o código
          </p>
        </div>

        {/* Method tabs */}
        <div className="mb-6 flex rounded-2xl bg-gray-100 p-1 dark:bg-white/5">
          {(["whatsapp", "email"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMethodChange(m)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                method === m
                  ? "bg-white text-gray-900 shadow-md dark:bg-white/10 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {m === "whatsapp" ? (
                <><span>📱</span> WhatsApp</>
              ) : (
                <><span>✉️</span> E-mail</>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* ── EMAIL FLOW ── */}
        {method === "email" && (
          emailSent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800/40 dark:bg-green-950/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Se esse e-mail estiver cadastrado, você receberá um link em breve. Verifique sua caixa de entrada e spam.
                </p>
              </div>
              <Link href="/login" className="block text-sm font-semibold text-rose-600 hover:underline dark:text-rose-400">
                ← Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-mail cadastrado
                </label>
                <input
                  id="email" type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  disabled={isPending} className={inputClass}
                />
              </div>
              <button type="submit" disabled={isPending} className={btnPrimary}>
                {isPending ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>
          )
        )}

        {/* ── WHATSAPP FLOW ── */}
        {method === "whatsapp" && wppStep === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp cadastrado
              </label>
              <input
                id="phone" type="tel" required
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={isPending} className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-400">Deve ser o mesmo número que você cadastrou na conta.</p>
            </div>
            <button type="submit" disabled={isPending} className={btnPrimary}>
              {isPending ? "Enviando..." : "Enviar código via WhatsApp"}
            </button>
          </form>
        )}

        {method === "whatsapp" && wppStep === "code" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800/40 dark:bg-green-950/20">
              <p className="text-sm text-green-800 dark:text-green-400">
                Código enviado para <strong>{phone}</strong>. Verifique seu WhatsApp.
              </p>
            </div>
            <div>
              <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Código de 6 dígitos
              </label>
              <input
                id="code" type="text" required
                inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                disabled={isPending}
                className={`${inputClass} text-center text-2xl tracking-[0.5em] font-bold`}
              />
            </div>
            <button type="submit" disabled={isPending || code.length !== 6} className={btnPrimary}>
              {isPending ? "Verificando..." : "Verificar código"}
            </button>
            <button
              type="button"
              onClick={() => { setWppStep("phone"); setCode(""); setError(null); }}
              className="w-full text-center text-sm text-gray-500 hover:text-rose-600 dark:text-gray-400"
            >
              Reenviar código
            </button>
          </form>
        )}

        {!emailSent && (
          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            Lembrou a senha?{" "}
            <Link href="/login" className="font-semibold text-rose-600 hover:underline dark:text-rose-400">
              Entrar
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
