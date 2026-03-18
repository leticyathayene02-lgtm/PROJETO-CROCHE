"use client";

import { useState, useTransition } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { savePaymentConfig, testPaymentConnection } from "@/app/admin/(protected)/settings/payment/actions";
import { StatusBadge } from "@/components/admin/status-badge";

export interface PaymentFormProps {
  hasConfig: boolean;
  maskedKey: string | null;
  environment: "SANDBOX" | "PRODUCTION";
  lastTestedAt: string | null;
  lastTestOk: boolean | null;
  lastTestMsg: string | null;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PaymentForm({
  hasConfig,
  maskedKey,
  environment: initialEnv,
  lastTestedAt,
  lastTestOk,
  lastTestMsg,
}: PaymentFormProps) {
  const [env, setEnv] = useState<"SANDBOX" | "PRODUCTION">(initialEnv);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{
    ok: boolean | null;
    msg: string | null;
    at: string | null;
  }>({
    ok: lastTestOk,
    msg: lastTestMsg,
    at: lastTestedAt,
  });

  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  function handleSave() {
    setSaveMsg(null);
    startSave(async () => {
      const trimmedKey = apiKey.trim();
      const result = await savePaymentConfig({
        ...(trimmedKey ? { apiKey: trimmedKey } : {}),
        environment: env,
      });
      if ("error" in result && result.error) {
        setSaveMsg({ ok: false, text: result.error });
      } else {
        setSaveMsg({ ok: true, text: "Configurações salvas com sucesso." });
        setApiKey("");
      }
    });
  }

  function handleTest() {
    startTest(async () => {
      const result = await testPaymentConnection();
      setTestResult({
        ok: result.success,
        msg: result.message,
        at: new Date().toISOString(),
      });
    });
  }

  const statusVariant =
    testResult.ok === null
      ? "neutral"
      : testResult.ok
      ? "success"
      : "danger";

  const statusLabel =
    testResult.ok === null ? "Não testado" : testResult.ok ? "Conectado" : "Falha";

  return (
    <div className="space-y-6">
      {/* Main config card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <h2 className="mb-6 text-sm font-semibold text-white">Integração Asaas</h2>

        {/* Environment toggle */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium text-gray-400">
            Ambiente
          </label>
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.04] p-1 gap-1">
            <button
              type="button"
              onClick={() => setEnv("SANDBOX")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                env === "SANDBOX"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Sandbox
            </button>
            <button
              type="button"
              onClick={() => setEnv("PRODUCTION")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                env === "PRODUCTION"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Produção
            </button>
          </div>
          {env === "PRODUCTION" && (
            <p className="mt-2 text-xs text-amber-400">
              Atenção: ambiente de produção processa cobranças reais.
            </p>
          )}
        </div>

        {/* API Key field */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium text-gray-400">
            API Key Asaas
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Lock className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={maskedKey ?? "Cole sua API Key aqui..."}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-10 text-sm text-gray-200 placeholder:text-gray-600 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {hasConfig && (
            <p className="mt-1.5 text-xs text-gray-600">
              Deixe em branco para manter a chave atual.
            </p>
          )}
        </div>

        {/* Save feedback */}
        {saveMsg && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
              saveMsg.ok
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {saveMsg.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {saveMsg.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isTesting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Salvar configurações
          </button>

          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || isSaving || !hasConfig}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTesting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Testar conexão
          </button>

          {!hasConfig && (
            <span className="text-xs text-gray-600">
              Salve uma configuração antes de testar.
            </span>
          )}
        </div>
      </div>

      {/* Connection status card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Status da conexão</h2>
          <StatusBadge label={statusLabel} variant={statusVariant} dot />
        </div>

        {testResult.msg ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {testResult.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              )}
              <p className="text-sm text-gray-300">{testResult.msg}</p>
            </div>
            {testResult.at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                Último teste: {formatDate(testResult.at)}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Nenhum teste realizado ainda. Salve a configuração e clique em "Testar conexão".
          </p>
        )}
      </div>
    </div>
  );
}
