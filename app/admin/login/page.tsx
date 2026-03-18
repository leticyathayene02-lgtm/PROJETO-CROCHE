"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl shadow-lg">
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-gray-400">Trama Pro — acesso restrito</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-300">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@tramapro.com"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          Acesso restrito a administradores do sistema.
        </p>
      </div>
    </div>
  );
}
