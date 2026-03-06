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

  // Prevent hydration mismatch — render placeholder until mounted
  if (!mounted) {
    return <div className={`h-9 w-9 rounded-full ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  const base =
    variant === "ghost"
      ? "flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      : "flex h-9 w-9 items-center justify-center rounded-full border border-rose-200/80 bg-white/80 text-rose-600 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-rose-400 dark:hover:bg-white/10";

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
