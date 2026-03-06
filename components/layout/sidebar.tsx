"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calculator,
  Package,
  TrendingUp,
  Archive,
  Settings,
  ChevronRight,
  LogOut,
  ClipboardList,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  {
    href: "/app/overview",
    label: "Visão Geral",
    icon: LayoutDashboard,
  },
  {
    href: "/app/pricing",
    label: "Calculadora",
    icon: Calculator,
  },
  {
    href: "/app/products",
    label: "Produtos",
    icon: Package,
  },
  {
    href: "/app/customers",
    label: "Clientes",
    icon: Users,
  },
  {
    href: "/app/orders",
    label: "Pedidos",
    icon: ClipboardList,
  },
  {
    href: "/app/finance",
    label: "Financeiro",
    icon: TrendingUp,
  },
  {
    href: "/app/inventory",
    label: "Estoque",
    icon: Archive,
  },
  {
    href: "/app/settings/billing",
    label: "Assinatura",
    icon: Settings,
  },
];

interface SidebarProps {
  workspaceName: string;
  plan: "FREE" | "PREMIUM";
  userImage?: string | null;
  userName?: string | null;
  onSignOut: () => void;
}

export function Sidebar({
  workspaceName,
  plan,
  userName,
  onSignOut,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-rose-100 bg-white dark:border-white/8 dark:bg-gray-900">
      {/* Brand / Workspace */}
      <div className="border-b border-rose-100 p-4 dark:border-white/8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧶</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-rose-900 dark:text-rose-100">
              {workspaceName}
            </p>
            <div className="flex items-center gap-1">
              <Badge
                variant={plan === "PREMIUM" ? "default" : "secondary"}
                className={cn(
                  "h-4 px-1 text-[10px]",
                  plan === "PREMIUM"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                )}
              >
                {plan === "PREMIUM" ? "Premium ✨" : "Grátis"}
              </Badge>
            </div>
          </div>
          <ThemeToggle variant="ghost" className="shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-gray-400 dark:text-gray-500"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3 w-3 text-rose-400 dark:text-rose-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Sign Out */}
      <div className="border-t border-rose-100 p-3 dark:border-white/8">
        <div className="mb-2 flex items-center gap-2 px-3 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-700 dark:bg-rose-900/50 dark:text-rose-400">
            {userName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <span className="flex-1 truncate text-xs text-gray-600 dark:text-gray-400">
            {userName}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="w-full justify-start gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
