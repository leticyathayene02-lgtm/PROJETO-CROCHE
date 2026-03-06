import { AuthCard } from "@/components/auth/auth-card";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Link from "next/link";

const BENEFITS = [
  {
    icon: "🧮",
    title: "Precificação inteligente",
    desc: "Calcule o preço justo de cada peça com margem, horas e materiais.",
  },
  {
    icon: "📦",
    title: "Estoque e produtos",
    desc: "Controle seus fios, agulhas e acompanhe cada produto do seu catálogo.",
  },
  {
    icon: "💰",
    title: "Financeiro simplificado",
    desc: "Veja quanto você ganhou, gastou e qual o lucro real do seu ateliê.",
  },
];

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-950 dark:via-rose-950/20 dark:to-gray-950">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="animate-blob pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-rose-300/25 blur-3xl dark:bg-rose-600/10"
      />
      <div
        aria-hidden="true"
        className="animate-blob pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-700/8"
        style={{ animationDelay: "3s" }}
      />
      <div
        aria-hidden="true"
        className="animate-blob pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-purple-300/15 blur-3xl dark:bg-purple-700/8"
        style={{ animationDelay: "6s" }}
      />

      {/* Theme toggle + back link — top right */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <Link
          href="/"
          className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 sm:block"
        >
          ← Voltar ao site
        </Link>
        <ThemeToggle />
      </div>

      {/* ── Left hero column (desktop only) ─────────────────── */}
      <aside
        className="relative hidden flex-1 flex-col justify-between p-12 lg:flex"
        aria-label="Apresentação do Ateliê Digital"
      >
        {/* Logo */}
        <Link href="/" className="flex w-fit items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🧶</span>
          <span className="text-xl font-bold tracking-tight text-rose-900 dark:text-rose-100">
            Ateliê Digital
          </span>
        </Link>

        {/* Hero copy */}
        <div className="max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/60 px-4 py-1.5 text-xs font-semibold text-rose-600 backdrop-blur-sm dark:border-rose-800/50 dark:bg-white/5 dark:text-rose-400">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500 dark:bg-rose-400"
              aria-hidden="true"
            />
            Plataforma #1 para artesãs
          </div>

          <h1 className="font-heading mb-4 text-4xl font-bold leading-tight text-rose-950 dark:text-white">
            Transforme seu talento em{" "}
            <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
              negócio lucrativo
            </span>
          </h1>
          <p className="mb-10 text-base leading-relaxed text-rose-700/80 dark:text-rose-300/70">
            Gerencie precificação, pedidos e finanças do seu ateliê em um só
            lugar — simples, rápido e feito para quem cria com as mãos.
          </p>

          {/* Benefits */}
          <ul className="mb-10 space-y-4" aria-label="Principais benefícios">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-lg shadow-sm backdrop-blur-sm dark:bg-white/10"
                  aria-hidden="true"
                >
                  {b.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                    {b.title}
                  </p>
                  <p className="text-sm text-rose-600/80 dark:text-rose-300/70">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <figure className="rounded-2xl border border-white/60 bg-white/50 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <blockquote>
              <p className="text-sm leading-relaxed text-rose-800 dark:text-rose-200">
                &ldquo;Antes eu chutava o preço e sempre saía no prejuízo. Com o
                Ateliê Digital, aumentei meu faturamento em{" "}
                <strong>40%</strong> em dois meses!&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white"
                aria-hidden="true"
              >
                M
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-900 dark:text-rose-100">
                  Mariana S.
                </p>
                <p className="text-xs text-rose-500 dark:text-rose-400">Artesã há 5 anos</p>
              </div>
              <div className="ml-auto flex gap-0.5" aria-label="5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-amber-400" aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>
            </figcaption>
          </figure>
        </div>

        <p className="text-xs text-rose-400 dark:text-rose-600">
          © {new Date().getFullYear()} Ateliê Digital. Todos os direitos reservados.
        </p>
      </aside>

      {/* ── Right auth column ────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        {/* Mobile-only logo */}
        <div className="mb-8 text-center lg:hidden">
          <Link href="/" className="inline-block">
            <span className="mb-2 block text-4xl" aria-hidden="true">🧶</span>
            <h1 className="text-2xl font-bold tracking-tight text-rose-900 dark:text-rose-100">
              Ateliê Digital
            </h1>
          </Link>
          <p className="mt-1 text-sm text-rose-500 dark:text-rose-400">
            Precifique, organize e lucre com seu crochê
          </p>
        </div>

        <AuthCard />

        {/* Free plan note */}
        <p className="mt-6 flex items-center gap-1.5 text-center text-xs text-rose-400 dark:text-rose-500">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Grátis para sempre no plano básico. Sem cartão de crédito.
        </p>
      </main>
    </div>
  );
}
