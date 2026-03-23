"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile, changePassword, updateHourlyRate } from "./actions";

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-500/20";
const BTN =
  "rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed";
const LABEL = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

interface Props {
  user: { name: string; email: string; phone: string };
  defaultHourlyRate: number;
}

export function ProfileForm({ user, defaultHourlyRate }: Props) {
  // ── Personal info ─────────────────────────────────────
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [pendingProfile, startProfile] = useTransition();

  function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    startProfile(async () => {
      const result = await updateProfile({ name, phone });
      if (result.success) toast.success("Perfil atualizado!");
      else toast.error(result.error);
    });
  }

  // ── Password ──────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pendingPwd, startPwd] = useTransition();

  function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error("As senhas não coincidem."); return; }
    startPwd(async () => {
      const result = await changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      if (result.success) {
        toast.success("Senha alterada com sucesso!");
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } else {
        toast.error(result.error);
      }
    });
  }

  // ── Hourly rate ───────────────────────────────────────
  const [rate, setRate] = useState(defaultHourlyRate > 0 ? String(defaultHourlyRate) : "");
  const [pendingRate, startRate] = useTransition();

  function handleRate(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(rate.replace(",", ".")) || 0;
    startRate(async () => {
      const result = await updateHourlyRate(val);
      if (result.success) toast.success("Valor da hora salvo! A calculadora vai pré-preencher automaticamente.");
    });
  }

  return (
    <div className="space-y-6">
      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfile} className="space-y-4">
            <div>
              <label className={LABEL}>Nome</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome" className={INPUT} disabled={pendingProfile}
              />
            </div>
            <div>
              <label className={LABEL}>E-mail</label>
              <input
                type="email" value={user.email} readOnly
                className={`${INPUT} cursor-not-allowed opacity-60`}
              />
              <p className="mt-1 text-xs text-gray-400">O e-mail não pode ser alterado.</p>
            </div>
            <div>
              <label className={LABEL}>WhatsApp</label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999" className={INPUT} disabled={pendingProfile}
              />
              <p className="mt-1 text-xs text-gray-400">Usado para recuperação de senha.</p>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={pendingProfile} className={BTN}>
                {pendingProfile ? "Salvando..." : "Salvar dados"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Hourly rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valor da sua hora</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRate} className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Este valor será pré-preenchido automaticamente na calculadora de preços toda vez que você abrir um novo cálculo.
            </p>
            <div>
              <label className={LABEL}>R$/hora</label>
              <div className="flex gap-3">
                <input
                  type="text" inputMode="decimal"
                  value={rate} onChange={(e) => setRate(e.target.value)}
                  placeholder="Ex: 25,00" className={`${INPUT} flex-1`}
                  disabled={pendingRate}
                />
                <button type="submit" disabled={pendingRate} className={BTN}>
                  {pendingRate ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className={LABEL}>Senha atual</label>
              <input
                type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••" className={INPUT} disabled={pendingPwd} required
              />
            </div>
            <div>
              <label className={LABEL}>Nova senha</label>
              <input
                type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Mínimo 6 caracteres" className={INPUT} disabled={pendingPwd} required minLength={6}
              />
            </div>
            <div>
              <label className={LABEL}>Confirmar nova senha</label>
              <input
                type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Repita a senha" className={INPUT} disabled={pendingPwd} required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={pendingPwd} className={BTN}>
                {pendingPwd ? "Alterando..." : "Alterar senha"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
