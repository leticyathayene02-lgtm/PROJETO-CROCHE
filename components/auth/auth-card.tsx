"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";

type Tab = "signup" | "signin";

const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20";

const SPINNER = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export function AuthCard() {
  const [tab, setTab] = useState<Tab>("signup");
  const [isPending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = tab === "signup";
  const isLoading = isPending || redirecting;

  function handleTabChange(t: Tab) {
    setTab(t);
    setError(null);
  }

  // ── Signup: register directly ──────────────────────────
  function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email,
          phone: phone.trim() || undefined,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ocorreu um erro. Tente novamente.");
        return;
      }
      setRedirecting(true);
      window.location.href = "/app/overview";
    });
  }

  // ── Login ─────────────────────────────────────────────
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ocorreu um erro. Tente novamente.");
        return;
      }
      setRedirecting(true);
      window.location.href = "/app/overview";
    });
  }

  return (
    <div
      className="w-full max-w-md rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl shadow-rose-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-[oklch(0.18_0.01_280)]/90 dark:shadow-black/30"
      role="main"
      aria-label="Formulário de autenticação"
    >
      {/* Tabs */}
      <div className="mb-8 flex rounded-2xl bg-gray-100 p-1 dark:bg-white/5" role="tablist">
        {(["signup", "signin"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => handleTabChange(t)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2 ${
              tab === t
                ? "bg-white text-gray-900 shadow-md dark:bg-white/10 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t === "signup" ? "Criar conta" : "Entrar"}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isSignup ? "Crie sua conta no Trama Pro" : "Bem-vinda de volta!"}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isSignup
            ? "Preencha os dados abaixo para começar ✨"
            : "Entre com seu e-mail e senha para continuar ✨"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ── SIGNUP ── */}
      {isSignup && (
        <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              id="name" type="text" autoComplete="name"
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome de artesã"
              className={INPUT_CLASS} disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail <span className="text-rose-500">*</span>
            </label>
            <input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={INPUT_CLASS} disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`${INPUT_CLASS} pr-11`} disabled={isLoading}
              />
              <button
                type="button" tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              WhatsApp <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              id="phone" type="tel" autoComplete="tel"
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className={INPUT_CLASS} disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-400">Usado para recuperar senha. Pode adicionar depois.</p>
          </div>

          <button
            type="submit" disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? <>{SPINNER}<span>{redirecting ? "Entrando no painel..." : "Criando conta..."}</span></>
              : <span>Criar minha conta ✨</span>
            }
          </button>
        </form>
      )}

      {/* ── LOGIN ── */}
      {!isSignup && (
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail
            </label>
            <input
              id="email" type="email" autoComplete="username" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={INPUT_CLASS} disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <div className="relative">
              <input
                id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className={`${INPUT_CLASS} pr-11`} disabled={isLoading}
              />
              <button
                type="button" tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-xs text-rose-600 hover:underline dark:text-rose-400">
              Esqueci minha senha
            </a>
          </div>

          <button
            type="submit" disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? <>{SPINNER}<span>{redirecting ? "Entrando no painel..." : "Entrando..."}</span></>
              : <>
                  <span>Entrar</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" aria-hidden="true" />
                </>
            }
          </button>
        </form>
      )}

      {/* Switch tab */}
      <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
        {isSignup ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
        <button
          type="button"
          onClick={() => handleTabChange(isSignup ? "signin" : "signup")}
          className="font-semibold text-rose-600 underline-offset-2 hover:underline dark:text-rose-400"
        >
          {isSignup ? "Entrar" : "Criar conta"}
        </button>
      </p>

      <p className="mt-4 text-center text-xs leading-relaxed text-gray-400 dark:text-gray-500">
        Ao continuar, você concorda com nossos{" "}
        <a href="/termos" className="underline underline-offset-2 hover:text-rose-500 dark:hover:text-rose-400">Termos de Uso</a>{" "}
        e{" "}
        <a href="/privacidade" className="underline underline-offset-2 hover:text-rose-500 dark:hover:text-rose-400">Política de Privacidade</a>.
      </p>
    </div>
  );
}
