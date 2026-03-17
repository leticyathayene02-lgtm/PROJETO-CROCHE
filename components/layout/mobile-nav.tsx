"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calculator,
  ClipboardList,
  TrendingUp,
  Ellipsis,
} from "lucide-react";

const navItems = [
  { href: "/app/overview", label: "Início", icon: LayoutDashboard },
  { href: "/app/pricing", label: "Calcular", icon: Calculator },
  { href: "/app/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/app/finance", label: "Financeiro", icon: TrendingUp },
  { href: "/app/materials", label: "Mais", icon: Ellipsis },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/90 backdrop-blur-lg dark:bg-[oklch(0.15_0.008_280)]/90 md:hidden">
      <div className="flex">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                isActive
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
