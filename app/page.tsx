import Link from "next/link";
import { LandingHeader } from "./_components/landing-header";
import { LandingFaq } from "./_components/landing-faq";
import {
  Calculator,
  TrendingUp,
  Archive,
  ClipboardList,
  Check,
  ArrowRight,
  Sparkles,
  Star,
  Target,
  Clock,
  ShieldCheck,
} from "lucide-react";

// ─── App mock preview (pure CSS/JSX — no external images needed) ─────────────

function AppMockCard() {
  const bars = [55, 70, 45, 85, 60, 92];
  const items = [
    { name: "Bolsa trapézio", price: "R$ 89,90", badge: "vendida" },
    { name: "Amigurumi gatinho", price: "R$ 65,00", badge: "nova" },
    { name: "Tapete redondo", price: "R$ 120,00", badge: "vendida" },
  ];

  return (
    <div className="animate-float w-full max-w-sm rounded-3xl border border-white/20 bg-white/90 p-5 shadow-2xl shadow-rose-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/90 dark:shadow-rose-900/20">
      {/* Window chrome */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Ateliê da Ana ✨
          </span>
        </div>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
          Premium
        </span>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Lucro", value: "R$ 2.340", color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Receita", value: "R$ 4.200", color: "text-rose-600 dark:text-rose-400" },
          { label: "Produtos", value: "18", color: "text-violet-600 dark:text-violet-400" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-white/5"
          >
            <p className={`font-heading text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px] text-gray-400">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div className="mb-4 rounded-xl bg-gray-50 p-3 dark:bg-white/5">
        <p className="mb-2 text-[10px] font-semibold text-gray-400">
          Faturamento — últimos 6 meses
        </p>
        <div className="flex h-12 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${h}%`,
                background:
                  i === 5
                    ? "linear-gradient(to top, #e11d48, #f43f5e)"
                    : "linear-gradient(to top, #fecdd3, #fda4af)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent items */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Últimos cálculos
        </p>
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-white/5"
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {item.name}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  item.badge === "nova"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                }`}
              >
                {item.badge}
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {item.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reusable section components ─────────────────────────────────────────────

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold text-rose-600 backdrop-blur-sm dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-400">
      <span
        className="h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} estrelas`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        aria-label="Apresentação"
        className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50/60 to-purple-50/40 dark:from-gray-950 dark:via-rose-950/15 dark:to-gray-950"
      >
        {/* Background blobs */}
        <div
          aria-hidden="true"
          className="animate-blob pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-600/8"
        />
        <div
          aria-hidden="true"
          className="animate-blob pointer-events-none absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-pink-300/15 blur-3xl dark:bg-pink-700/6"
          style={{ animationDelay: "3s" }}
        />
        <div
          aria-hidden="true"
          className="animate-blob pointer-events-none absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-violet-300/12 blur-3xl dark:bg-violet-700/6"
          style={{ animationDelay: "6s" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy */}
            <div>
              <div className="mb-6">
                <SectionTag>Plataforma #1 para artesãs brasileiras</SectionTag>
              </div>

              <h1 className="font-heading text-display-xl mb-6 text-gray-900 dark:text-white">
                Seu ateliê,{" "}
                <em className="text-rose-600 not-italic dark:text-rose-400">organizado</em>
                {" "}e{" "}
                <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent dark:from-rose-400 dark:to-pink-400">
                  lucrativo.
                </span>
              </h1>

              <p className="mb-8 max-w-lg text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                A calculadora de preços, controle financeiro e estoque de fios que toda
                artesã precisava. Simples, bonito e feito para você lucrar de verdade.
              </p>

              {/* Benefit bullets */}
              <ul className="mb-10 space-y-3" aria-label="Benefícios principais">
                {[
                  "Calcule o preço justo de cada peça em segundos",
                  "Nunca mais venda no prejuízo sem saber",
                  "Controle seus fios, finanças e metas em um só lugar",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-300/50 active:translate-y-0 dark:shadow-rose-900/30"
                >
                  <Sparkles className="h-4 w-4" />
                  Criar conta grátis — 7 dias grátis
                  <span
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"
                    aria-hidden="true"
                  />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white/70 px-6 py-3.5 text-sm font-semibold text-rose-700 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:border-rose-800/50 dark:bg-white/5 dark:text-rose-300 dark:hover:bg-white/10"
                >
                  Ver como funciona
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Trust signal */}
              <p className="mt-6 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Grátis para sempre no plano básico · Sem cartão de crédito
              </p>
            </div>

            {/* Right: floating app mock */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                {/* Glow behind card */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-rose-300/40 to-pink-300/30 blur-3xl dark:from-rose-700/20 dark:to-pink-700/15"
                />
                <AppMockCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section
        aria-label="Estatísticas de confiança"
        className="border-y border-gray-100 bg-white py-10 dark:border-white/5 dark:bg-gray-950"
      >
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {[
              { value: "2.400+", label: "Ateliês cadastrados" },
              { value: "R$ 1.2M+", label: "Em vendas precificadas" },
              { value: "98%", label: "Satisfação dos usuários" },
              { value: "4.9 ★", label: "Avaliação média" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-2xl font-bold text-rose-700 dark:text-rose-400">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" aria-label="Funcionalidades" className="py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <SectionTag>Tudo que você precisa</SectionTag>
            <h2 className="font-heading text-title mt-4 text-gray-900 dark:text-white">
              Quatro ferramentas. Um só lugar.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-gray-500 dark:text-gray-400">
              Chega de planilha bagunçada. O Trama Pro reúne tudo que uma
              artesã precisa para crescer.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Calculator className="h-6 w-6" />,
                bg: "bg-rose-50 dark:bg-rose-950/30",
                border: "border-rose-100 dark:border-rose-900/30",
                iconBg:
                  "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400",
                title: "Calculadora de Preço",
                desc: "Informe materiais, horas e margem. O sistema calcula o preço justo em segundos, já incluindo taxa de maquininha.",
                features: [
                  "Custo de fio por grama",
                  "Horas de trabalho",
                  "Taxa de maquininha",
                  "Margem de lucro",
                ],
              },
              {
                icon: <TrendingUp className="h-6 w-6" />,
                bg: "bg-emerald-50 dark:bg-emerald-950/20",
                border: "border-emerald-100 dark:border-emerald-900/20",
                iconBg:
                  "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
                title: "Controle Financeiro",
                desc: "Registre vendas e gastos. Veja o gráfico de faturamento dos últimos 6 meses e defina metas mensais.",
                features: [
                  "Entradas e saídas",
                  "Gráfico mensal",
                  "Metas de receita",
                  "Lucro líquido real",
                ],
              },
              {
                icon: <Archive className="h-6 w-6" />,
                bg: "bg-violet-50 dark:bg-violet-950/20",
                border: "border-violet-100 dark:border-violet-900/20",
                iconBg:
                  "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400",
                title: "Estoque de Fios",
                desc: "Cadastre seus fios com quantidade e custo. Receba alertas quando o estoque estiver baixo.",
                features: [
                  "Marca, cor e linha",
                  "Gramas disponíveis",
                  "Custo por grama",
                  "Alerta de estoque baixo",
                ],
              },
              {
                icon: <ClipboardList className="h-6 w-6" />,
                bg: "bg-amber-50 dark:bg-amber-950/20",
                border: "border-amber-100 dark:border-amber-900/20",
                iconBg:
                  "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400",
                title: "Pedidos & Encomendas",
                desc: "Do pedido ao pagamento: tudo organizado. Acompanhe prazos, clientes e status de cada encomenda do ateliê.",
                features: [
                  "Qual peça e detalhes do pedido",
                  "Quem pediu (cliente)",
                  "Status: não pago / 50% / pago",
                  "Data prevista de entrega",
                ],
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group flex flex-col rounded-3xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.bg} ${feature.border}`}
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg}`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-heading mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {feature.desc}
                </p>
                <ul className="mt-auto space-y-2">
                  {feature.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        id="como-funciona"
        aria-label="Como funciona"
        className="bg-gradient-to-br from-rose-50/60 via-pink-50/30 to-white py-20 dark:from-gray-900 dark:via-rose-950/10 dark:to-gray-950"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <SectionTag>Simples de usar</SectionTag>
            <h2 className="font-heading text-title mt-4 text-gray-900 dark:text-white">
              Comece em menos de 5 minutos
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-gray-500 dark:text-gray-400">
              Sem tutorial complicado. Em três passos simples seu ateliê está organizado.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: <Sparkles className="h-7 w-7" />,
                title: "Crie sua conta grátis",
                desc: "Cadastre-se com seu e-mail em segundos. Sem cartão de crédito. O Trama Pro estará pronto imediatamente.",
              },
              {
                step: "2",
                icon: <Archive className="h-7 w-7" />,
                title: "Cadastre seus materiais",
                desc: "Adicione seus fios, custos e informações do ateliê. A calculadora usa esses dados para precificar com precisão.",
              },
              {
                step: "3",
                icon: <TrendingUp className="h-7 w-7" />,
                title: "Calcule e lucre mais",
                desc: "Use a calculadora para cada nova peça. Registre as vendas e acompanhe seu lucro crescer mês a mês.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line (desktop) */}
                {i < 2 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-[calc(50%+64px)] top-10 hidden h-px w-[calc(100%-128px)] border-t-2 border-dashed border-rose-200 dark:border-rose-900/50 sm:block"
                  />
                )}
                <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40 dark:shadow-rose-900/30">
                  {item.icon}
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-rose-600 shadow-sm dark:bg-gray-900 dark:text-rose-400">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-heading mb-2 font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-8 py-4 font-semibold text-white shadow-lg shadow-rose-300/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:shadow-rose-900/30"
            >
              <Sparkles className="h-4 w-4" />
              Quero começar grátis
            </Link>
          </div>
        </div>
      </section>

      {/* ── RESULTS / METRICS ────────────────────────────────────────────── */}
      <section
        id="resultados"
        aria-label="Resultados"
        className="bg-gradient-to-br from-rose-700 via-rose-600 to-pink-500 py-20"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              Resultados reais
            </div>
            <h2 className="font-heading text-title mt-4 text-white">
              O que nossas usuárias alcançaram
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <TrendingUp className="h-7 w-7" />,
                value: "+40%",
                label: "Faturamento médio",
                desc: "De aumento no faturamento nos primeiros 2 meses de uso",
              },
              {
                icon: <Clock className="h-7 w-7" />,
                value: "3h",
                label: "Economizadas por semana",
                desc: "Sem planilhas, sem cálculos manuais confusos e sem retrabalho",
              },
              {
                icon: <Target className="h-7 w-7" />,
                value: "0",
                label: "Peças no prejuízo",
                desc: "Com a calculadora, você sempre sabe antes de vender quanto vai lucrar",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-3xl border border-white/15 bg-white/10 p-7 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-white/15"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
                  {metric.icon}
                </div>
                <p className="font-heading mb-1 text-4xl font-black text-white">
                  {metric.value}
                </p>
                <p className="mb-2 text-sm font-semibold text-rose-200">{metric.label}</p>
                <p className="text-xs leading-relaxed text-rose-100/80">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section
        id="depoimentos"
        aria-label="Depoimentos"
        className="py-20 dark:bg-gray-950"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <SectionTag>Depoimentos</SectionTag>
            <h2 className="font-heading text-title mt-4 text-gray-900 dark:text-white">
              Quem usa, recomenda
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "Mariana S.",
                role: "Artesã há 5 anos",
                avatar: "M",
                color: "from-rose-400 to-pink-500",
                quote:
                  "Antes eu chutava o preço e sempre saía no prejuízo. Com o Trama Pro, aumentei meu faturamento em 40% em dois meses! A calculadora é incrível.",
              },
              {
                name: "Ana C.",
                role: "Ateliê Fios e Sonhos",
                avatar: "A",
                color: "from-violet-400 to-purple-500",
                quote:
                  "Finalmente consigo saber quanto estou lucrando de verdade. A calculadora me salvou de vender no prejuízo várias vezes. Indico para todas as minhas amigas!",
              },
              {
                name: "Letícia M.",
                role: "Criadora de conteúdo de crochê",
                avatar: "L",
                color: "from-emerald-400 to-teal-500",
                quote:
                  "Recomendo para todas as minhas seguidoras. Simples de usar, funciona lindo no celular e me ajudou a profissionalizar meu ateliê.",
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/8 dark:bg-white/3"
              >
                <StarRating />
                <blockquote className="my-4 flex-1">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-white/8">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${t.color}`}
                    aria-hidden="true"
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ──────────────────────────────────────────────── */}
      <section aria-label="Planos" className="bg-gray-50/80 py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <SectionTag>Planos</SectionTag>
            <h2 className="font-heading text-title mt-4 text-gray-900 dark:text-white">
              Comece grátis, cresça sem limites
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-3xl border border-gray-200 bg-white p-7 dark:border-white/10 dark:bg-white/4">
              <p className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                Gratuito
              </p>
              <p className="mt-1 text-3xl font-black text-gray-900 dark:text-white">
                R$ 0
                <span className="text-sm font-normal text-gray-400">/mês</span>
              </p>
              <p className="mt-1 mb-2 text-xs text-gray-400">Para começar e descobrir</p>
              <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                🎁 7 dias grátis para experimentar
              </span>
              <ul className="mb-7 space-y-2.5">
                {[
                  "3 cálculos/mês",
                  "5 transações/mês",
                  "3 produtos",
                  "Estoque de fios",
                  "Metas mensais",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full rounded-2xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
              >
                Criar conta grátis
              </Link>
            </div>

            {/* Premium */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-pink-500 p-7 text-white shadow-xl shadow-rose-300/30 dark:shadow-rose-900/30">
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/8"
              />
              <div className="relative">
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </div>
                <p className="mt-3 font-heading text-lg font-bold">Premium</p>
                <p className="mt-1 text-3xl font-black">
                  R$ 29,90
                  <span className="text-sm font-normal text-rose-200">/mês</span>
                </p>
                <p className="mt-1 mb-6 text-xs text-rose-200">Para quem vive do crochê</p>
                <ul className="mb-7 space-y-2.5">
                  {[
                    "Cálculos ilimitados",
                    "Transações ilimitadas",
                    "Produtos ilimitados",
                    "Histórico completo",
                    "Suporte prioritário",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="block w-full rounded-2xl bg-white py-3 text-center text-sm font-bold text-rose-600 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Começar com Premium
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" aria-label="Perguntas frequentes" className="py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <SectionTag>Dúvidas frequentes</SectionTag>
            <h2 className="font-heading text-title mt-4 text-gray-900 dark:text-white">
              Ficou alguma dúvida?
            </h2>
          </div>
          <LandingFaq />
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section
        aria-label="Chamada para ação final"
        className="relative overflow-hidden bg-gradient-to-br from-rose-700 via-rose-600 to-pink-500 py-20"
      >
        <div
          aria-hidden="true"
          className="animate-blob pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="animate-blob pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-pink-400/20 blur-2xl"
          style={{ animationDelay: "4s" }}
        />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <span className="mb-5 inline-block text-5xl" aria-hidden="true">
            🧶
          </span>
          <h2 className="font-heading text-display mb-4 text-white">
            Sua arte merece um ateliê organizado.
          </h2>
          <p className="mb-8 text-base text-rose-100/90">
            Junte-se a mais de 2.400 artesãs que já precificam com consciência,
            controlam suas finanças e lucram mais.
          </p>
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-8 py-4 font-bold text-rose-600 shadow-lg shadow-rose-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            <Sparkles className="h-4 w-4" />
            Criar conta grátis agora
            <span
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-rose-50/60 to-transparent transition-transform duration-500 group-hover:translate-x-full"
              aria-hidden="true"
            />
          </Link>
          <p className="mt-4 text-xs text-rose-200">
            Grátis para sempre no plano básico · Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-10 dark:border-white/5 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                🧶
              </span>
              <span className="font-heading font-bold text-rose-900 dark:text-rose-100">
                Trama Pro
              </span>
            </div>
            <div className="flex gap-6 text-xs text-gray-400 dark:text-gray-500">
              <a
                href="/termos"
                className="transition-colors hover:text-rose-500 dark:hover:text-rose-400"
              >
                Termos de Uso
              </a>
              <a
                href="/privacidade"
                className="transition-colors hover:text-rose-500 dark:hover:text-rose-400"
              >
                Privacidade
              </a>
              <Link
                href="/login"
                className="transition-colors hover:text-rose-500 dark:hover:text-rose-400"
              >
                Entrar
              </Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Trama Pro. Feito com 🧡 para artesãs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
