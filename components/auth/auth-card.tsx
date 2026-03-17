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
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = tab === "signup";
  const isLoading = isPending || redirecting;

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
      <div
        className="mb-8 flex rounded-2xl bg-gray-100 p-1 dark:bg-white/5"
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
                ? "bg-white text-gray-900 shadow-md dark:bg-white/10 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t === "signup" ? "Criar conta" : "Entrar"}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isSignup ? "Crie sua conta no Trama Pro" : "Bem-vinda de volta!"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isSignup
              ? "No cadastro, criamos sua conta no Trama Pro automaticamente ✨"
              : "Entre com seu e-mail e senha para continuar ✨"}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isSignup && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome (opcional)
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome de artesã"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-300/50 focus-visible:outline-2 focus-visible:outline-rose-600 focus-visible:outline-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-rose-900/30 dark:hover:shadow-rose-900/40"
          >
            {isLoading ? (
              <>{SPINNER}<span>{redirecting ? "Entrando no painel..." : isSignup ? "Criando sua conta..." : "Entrando..."}</span></>
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
          <a href="/termos" className="underline underline-offset-2 transition-colors hover:text-rose-500 dark:hover:text-rose-400">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="underline underline-offset-2 transition-colors hover:text-rose-500 dark:hover:text-rose-400">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}
