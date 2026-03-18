import { requireAdmin } from "@/lib/admin";
import { PageHeader } from "@/components/admin/page-header";
import { Settings, Shield, Database, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Configurações — Admin Trama Pro" };

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Configurações do painel administrativo" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Admin info */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Conta Admin</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nome</span>
              <span className="text-sm text-gray-200">{user.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm text-gray-200">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nível</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                Superadmin
              </span>
            </div>
          </div>
        </div>

        {/* Sistema */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20">
              <Database className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Sistema</h2>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "Plataforma", value: "Trama Pro" },
              { label: "Framework", value: "Next.js 15" },
              { label: "Banco de dados", value: "PostgreSQL (Neon)" },
              { label: "Deploy", value: "Vercel" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagamentos — card de destaque */}
      <Link
        href="/admin/settings/payment"
        className="group block rounded-xl border border-emerald-500/20 bg-[#111118] p-6 transition hover:border-emerald-500/40 hover:bg-[#141a14]"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <CreditCard className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Pagamentos</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Configurar integração com gateway (Asaas) — sandbox ou produção
              </p>
            </div>
          </div>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-500 opacity-0 transition group-hover:opacity-100">
            Configurar <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
