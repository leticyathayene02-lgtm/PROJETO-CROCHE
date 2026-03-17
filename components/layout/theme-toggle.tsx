"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "ghost";
}

export function ThemeToggle({ className = "", variant = "default" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={`h-9 w-9 rounded-full ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  const base =
    variant === "ghost"
      ? "flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
      : "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-rose-600 shadow-sm transition-all duration-200 hover:bg-rose-50 hover:shadow-md dark:bg-white/5 dark:text-rose-400 dark:hover:bg-white/10";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`${base} ${className}`}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
