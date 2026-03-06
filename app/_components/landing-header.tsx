"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#resultados", label: "Resultados" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100/60 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
            🧶
          </span>
          <span className="font-heading text-lg font-bold text-rose-900 dark:text-rose-100">
            Ateliê Digital
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 md:block"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-rose-300/50 active:translate-y-0 dark:shadow-rose-900/30"
          >
            Começar grátis
          </Link>

          {/* Mobile hamburger */}
          <button
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-rose-100/60 bg-white/95 px-4 pb-4 backdrop-blur-xl dark:border-white/5 dark:bg-gray-950/95 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:bg-rose-950/40"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-rose-200 px-4 py-2.5 text-center text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
              >
                Entrar na conta
              </Link>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
              >
                Criar conta grátis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
