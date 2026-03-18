import { requireAdmin } from "@/lib/admin";
import { deleteSession } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  async function handleSignOut() {
    "use server";
    await deleteSession();
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f] text-white antialiased">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <AdminSidebar
          adminName={user.name ?? "Admin"}
          adminEmail={user.email}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0f] px-6">
          {/* Mobile: brand */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-sm font-semibold text-white">Admin</span>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-gray-500">Sistema operacional</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-400">
                {(user.name ?? user.email)[0].toUpperCase()}
              </div>
              <span className="hidden text-sm text-gray-400 md:block">
                {user.name ?? user.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
