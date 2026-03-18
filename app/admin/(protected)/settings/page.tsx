import { requireAdmin } from "@/lib/admin";
import { PageHeader } from "@/components/admin/page-header";
import { Settings, Shield, Database } from "lucide-react";

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
    </div>
  );
}
