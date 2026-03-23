"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300">
        Link inválido.{" "}
        <Link href="/forgot-password" className="font-semibold underline">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ocorreu um erro. Tente novamente.");
        return;
      }

      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800/40 dark:bg-green-950/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-400">
            Senha redefinida com sucesso! Faça login com sua nova senha.
          </p>
        </div>
        <Link
          href="/login"
          className="block rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Nova senha
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          disabled={isPending}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repita a senha"
          disabled={isPending}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 px-4 dark:from-gray-950 dark:via-rose-950/20 dark:to-gray-950">
      <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/80 p-8 shadow-2xl shadow-rose-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-[oklch(0.18_0.01_280)]/90">
        <div className="mb-6 text-center">
          <span className="text-3xl">🧶</span>
          <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            Nova senha
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Escolha uma nova senha para sua conta
          </p>
        </div>

        <Suspense fallback={<p className="text-center text-sm text-gray-500">Carregando...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
