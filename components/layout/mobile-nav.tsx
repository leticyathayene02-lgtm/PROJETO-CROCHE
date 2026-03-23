"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calculator,
  ClipboardList,
  TrendingUp,
  Grid2X2,
} from "lucide-react";

const PRIMARY_PATHS = ["/app/overview", "/app/pricing", "/app/orders", "/app/finance"];

const navItems = [
  { href: "/app/overview", label: "Início", icon: LayoutDashboard },
  { href: "/app/pricing", label: "Calcular", icon: Calculator },
  { href: "/app/orders", label: "Pedidos", icon: ClipboardList },
  { href: "/app/finance", label: "Financeiro", icon: TrendingUp },
  { href: "/app/mais", label: "Mais", icon: Grid2X2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-lg dark:bg-[oklch(0.15_0.008_280)]/95 md:hidden safe-area-pb">
      <div className="flex">
        {navItems.map((item) => {
          // "Mais" fica ativo quando a rota atual não pertence a nenhum item primário
          const isActive =
            item.href === "/app/mais"
              ? !PRIMARY_PATHS.some(
                  (p) => pathname === p || pathname.startsWith(p + "/")
                )
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold transition-colors min-h-[56px]",
                isActive
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              <Icon className={cn("h-[22px] w-[22px] shrink-0", isActive && "drop-shadow-sm")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
