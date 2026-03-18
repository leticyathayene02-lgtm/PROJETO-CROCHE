import { requireAdmin } from "@/lib/admin";
import { deleteSession } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Visão Geral", icon: "📊" },
  { href: "/admin/users", label: "Usuários", icon: "👥" },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: "💳" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  async function handleSignOut() {
    "use server";
    await deleteSession();
    const cookieStore = await cookies();
    cookieStore.set("session", "", { httpOnly: true, sameSite: "lax", path: "/", expires: new Date(0) });
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-800 bg-gray-900 md:flex">
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-base">🛡️</span>
          <div>
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-xs text-gray-400">Trama Pro</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              <span>🚪</span> Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-sm font-semibold">Admin Trama Pro</span>
          </div>
          <div className="flex gap-2">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="px-2 py-1 text-xs text-gray-300 hover:text-white">
                {item.icon}
              </Link>
            ))}
          </div>
        </div>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
