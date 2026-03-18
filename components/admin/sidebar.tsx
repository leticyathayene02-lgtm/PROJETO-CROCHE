"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Usuários", icon: Users, exact: false },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard, exact: false },
  { href: "/admin/settings", label: "Configurações", icon: Settings, exact: false },
];

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
  onSignOut: () => void;
}

export function AdminSidebar({ adminName, adminEmail, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0e0e14]">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold text-white">Trama Pro</span>
          <span className="ml-2 rounded-full bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-indigo-600/15 text-indigo-300"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                  )}
                />
                {label}
              </span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-indigo-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-semibold text-indigo-400">
            {adminName?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-200">{adminName}</p>
            <p className="truncate text-[10px] text-gray-500">{adminEmail}</p>
          </div>
        </div>
        <form action={onSignOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-white/[0.04] hover:text-gray-300"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
