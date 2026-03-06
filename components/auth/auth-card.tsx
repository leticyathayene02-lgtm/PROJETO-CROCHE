"use client";

import { useState, useTransition } from "react";

type Tab = "signup" | "signin";

const SPINNER = (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export function AuthCard() {
  const [tab, setTab] = useState<Tab>("signup");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = tab === "signup";

  function handleTabChange(t: Tab) {
    setTab(t);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const body = isSignup
        ? { name: name.trim() || undefined, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ocorreu um erro. Tente novamente.");
        return;
      }

      // Hard redirect ensures the session cookie is sent with the new request.
      // router.push() can have race conditions with App Router prefetch cache.
      window.location.href = "/app/overview";
    });
  }

  return (
    <div
      className="w-full max-w-md rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl shadow-rose-200/30 backdrop-blur-xl"
      role="main"
      aria-label="Formulário de autenticação"
    >
      {/* ── Tabs ── */}
      <div
        className="mb-8 flex rounded-2xl bg-rose-50/80 p-1"
        role="tablist"
        aria-label="Modo de acesso"
      >
        {(["signup", "signin"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            id={`tab-${t}`}
            onClick={() => handleTabChange(t)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2 ${
              tab === t
                ? "bg-white text-rose-700 shadow-md shadow-rose-100"
                : "text-rose-400 hover:text-rose-600"
            }`}
          >
            {t === "signup" ? "Criar conta" : "Entrar"}
          </button>
        ))}
      </div>

      {/* ── Panel ── */}
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-rose-900">
            {isSignup ? "Crie seu ateliê digital" : "Bem-vinda de volta!"}
          </h2>
          <p className="mt-1 text-sm text-rose-500">
            {isSignup
              ? "No primeiro acesso, criamos seu ateliê automaticamente ✨"
              : "Entre com seu e-mail e senha para continuar ✨"}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name — only on signup */}
          {isSignup && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-rose-800">
                Nome (opcional)
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome de artesã"
                className="w-full rounded-xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-gray-800 placeholder-rose-300 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50"
                disabled={isPending}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-rose-800">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete={isSignup ? "email" : "username"}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full rounded-xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-gray-800 placeholder-rose-300 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50"
              disabled={isPending}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-rose-800">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Mínimo 6 caracteres" : "Sua senha"}
              className="w-full rounded-xl border border-rose-200 bg-white/80 px-4 py-3 text-sm text-gray-800 placeholder-rose-300 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50"
              disabled={isPending}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-300/50 focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>{SPINNER}<span>{isSignup ? "Criando seu ateliê..." : "Entrando..."}</span></>
            ) : (
              <>
                <span>{isSignup ? "Criar minha conta" : "Entrar"}</span>
                <span
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </form>

        {/* Switch tab link */}
        <p className="mt-5 text-center text-sm text-rose-400">
          {isSignup ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
          <button
            type="button"
            onClick={() => handleTabChange(isSignup ? "signin" : "signup")}
            className="font-semibold text-rose-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2"
          >
            {isSignup ? "Entrar" : "Criar conta"}
          </button>
        </p>

        {/* Microcopy */}
        <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
          Ao continuar, você concorda com nossos{" "}
          <a
            href="/termos"
            className="underline underline-offset-2 transition-colors hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2"
          >
            Termos de Uso
          </a>{" "}
          e{" "}
          <a
            href="/privacidade"
            className="underline underline-offset-2 transition-colors hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2"
          >
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}
