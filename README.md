# 🧶 Trama Pro

SaaS para artesãs que vendem peças e precisam precificar, organizar estoque e acompanhar lucro.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS v4** + shadcn/ui
- **PostgreSQL** (embedded via `embedded-postgres`) + **Prisma 7** ORM
- **Auth próprio** — email + senha (bcrypt) + session cookie httpOnly
- **Stripe** — assinatura Premium
- **Zod** — validação
- **React Hook Form** — formulários
- **Recharts** — gráficos

---

## Setup Local

### 1. Pré-requisitos

- Node.js 20+
- Conta Stripe (para pagamentos)

> **Não precisa instalar PostgreSQL** — o projeto usa `embedded-postgres` embutido.

### 2. Clonar e instalar

```bash
git clone https://github.com/leticyathayene02-lgtm/PROJETO-CROCHE.git
cd PROJETO-CROCHE
npm install
```

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL do PostgreSQL (padrão: `postgresql://postgres:postgres@localhost:5432/projeto_croche`) |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `STRIPE_PRICE_ID_PREMIUM` | ID do preço no Stripe |
| `NEXT_PUBLIC_APP_URL` | URL da app (ex: `http://localhost:3000`) |

### 4. Banco de dados

```bash
# Iniciar o banco embutido (mantenha o terminal aberto)
npm run db:start

# Em outro terminal — rodar migrations
npm run db:migrate

# (Opcional) Visualizar dados
npm run db:studio
```

### 5. Iniciar dev

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Fluxo de Autenticação

O sistema usa **email + senha** com bcrypt e session cookie httpOnly. Sem Google OAuth, sem magic link.

### Criar conta

1. Acesse `/login`
2. Clique na aba "Criar conta"
3. Informe nome (opcional), e-mail e senha (mín. 6 caracteres)
4. Workspace é criado automaticamente → redireciona para `/app/overview`

### Entrar

1. Acesse `/login`
2. Informe e-mail e senha
3. Sessão dura 30 dias via cookie `session` (httpOnly, sameSite=lax)

### Sair

- Clique em "Sair" no sidebar — exclui a sessão do banco e limpa o cookie

### Proteção de rotas

- `/app/*` → requer sessão válida → redireciona para `/login` se não autenticada
- `/login` → se já autenticada → redireciona para `/app/overview`
- Sem redirect loops: middleware edge-safe só lê o cookie; `/api/*` é excluído do matcher

### Arquivos relevantes do auth

| Arquivo | Função |
|---|---|
| `lib/session.ts` | `createSession`, `getSession`, `deleteSession` |
| `app/api/auth/register/route.ts` | Cria usuário + workspace + sessão |
| `app/api/auth/login/route.ts` | Valida bcrypt, cria sessão, seta cookie |
| `app/api/auth/logout/route.ts` | Deleta sessão, limpa cookie |
| `middleware.ts` | Proteção de rotas (edge-safe) |
| `lib/workspace.ts` | `requireWorkspace()` — guard para páginas do app |

---

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Iniciar desenvolvimento |
| `npm run dev:clean` | Limpar cache `.next` e iniciar dev |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar lint |
| `npm run format` | Formatar código |
| `npm run db:start` | Iniciar banco embutido |
| `npm run db:migrate` | Rodar migrations |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:push` | Push schema sem migration |

---

## Fluxo de Assinatura (Stripe)

1. Usuária acessa `/app/settings/billing`
2. Clica em "Assinar Premium"
3. Redirect para Stripe Checkout
4. Pagamento confirmado → Stripe dispara webhook em `/api/stripe/webhook`
5. Webhook atualiza `Subscription` no banco: `plan = PREMIUM, status = ACTIVE`
6. Usuária volta com `?success=true` e vê plano ativo

### Configurar webhook local (desenvolvimento)

```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Arquitetura

```
app/
├── (root)          → Redireciona para /login ou /app/overview
├── login/          → Tela de login (email + senha)
├── app/            → Dashboard protegido (requer auth)
│   ├── layout.tsx  → Shell com sidebar + mobile nav
│   ├── overview/   → Visão geral + resumo financeiro
│   ├── pricing/    → Calculadora de preço
│   ├── products/   → Catálogo de produtos
│   ├── finance/    → Controle financeiro
│   ├── inventory/  → Estoque de fios
│   └── settings/billing/ → Assinatura
└── api/
    ├── auth/login, register, logout → Auth próprio
    └── stripe/     → Checkout + Webhook

lib/
├── session.ts      → Sessões customizadas (create/get/delete)
├── prisma.ts       → Prisma client singleton
├── stripe.ts       → Stripe client + helpers
├── limits.ts       → Lógica de limites Free/Premium
└── workspace.ts    → Helpers de workspace/autorização
```

---

## Módulos MVP

### Calculadora de Preço
Calcula automaticamente:
- **Materiais**: fio + embalagem + mimo + etiquetas
- **Mão de obra**: horas × valor/hora
- **Taxas**: maquininha (%)
- **Lucro**: margem desejada (%)
- **Preço sugerido** = subtotal + taxas + lucro

### Financeiro
- Entradas e saídas com categoria
- Resumo mensal (total in, total out, lucro)
- Metas mensais de receita e lucro
- Gráfico dos últimos 6 meses

### Estoque
- Cadastro de fios com marca, linha, cor, gramas e custo
- Alerta automático de estoque baixo (< threshold)

### Planos

| Recurso | Grátis | Premium |
|---|---|---|
| Cálculos/mês | 10 | Ilimitado |
| Transações/mês | 20 | Ilimitado |
| Produtos | 10 | Ilimitado |

---

## Troubleshooting

### Erro estranho no browser / "module is not a function"

O `.next` pode ter cache corrompido (comum quando o banco não estava rodando durante o build). Solução:

**Windows:**
```bash
# 1. Matar todos os processos Node.js
taskkill /IM node.exe /F

# 2. Iniciar banco + dev limpo
npm run db:start
npm run dev:clean
```

**Mac/Linux:**
```bash
pkill -f node
npm run db:start
npm run dev:clean
```

> `dev:clean` remove a pasta `.next` antes de subir o servidor, garantindo build fresco.

### Múltiplos servidores na mesma porta

Se o Next.js subir em portas 3001, 3002... é porque processos antigos não foram encerrados. Use `taskkill /IM node.exe /F` (Windows) ou `pkill -f node` (Mac/Linux) para matar todos e reiniciar.

---

## Deploy (Vercel)

```bash
# Configurar variáveis de ambiente no Vercel Dashboard (ver .env.example)
# Rodar migrations no banco de produção
npx prisma migrate deploy
```

---

## Design System & Customização

### Trocar a imagem do hero
O hero da landing page usa um mock de app gerado em JSX puro (sem imagem externa). Para substituir por uma foto real:

1. Coloque a imagem em `/public/hero-croche.jpg` (ex: baixe do Unsplash/Pexels)
2. Edite `app/page.tsx`, localize o componente `AppMockCard` e substitua por:
```tsx
import Image from "next/image";
// ...
<Image
  src="/hero-croche.jpg"
  alt="Preview do Trama Pro"
  width={480}
  height={400}
  className="animate-float rounded-3xl shadow-2xl"
  priority
/>
```
3. Se usar URL externa (Unsplash), adicione o domínio em `next.config.ts` > `images.remotePatterns`.

### Mudar fontes
Fontes carregadas em `app/layout.tsx`:
- **Headings** (`font-heading`): `Fraunces` — substitua por `Playfair_Display`, `Libre_Baskerville` etc.
- **Body** (`font-sans`): `DM_Sans` — substitua por `Inter`, `Plus_Jakarta_Sans` etc.

```tsx
// app/layout.tsx
import { Fraunces, DM_Sans } from "next/font/google";

const fraunces = Fraunces({
  variable: "--font-heading",
  // Troque "Fraunces" por outra fonte do Google Fonts
  ...
});
```

Os CSS vars `--font-heading` e `--font-sans` são usados em `app/globals.css` no `@theme inline`. A classe `.font-heading` aplica a fonte de headings.

### Mudar cores / paleta
A paleta fica nos CSS custom properties em `app/globals.css`:
- **Light mode**: bloco `:root { ... }`
- **Dark mode**: bloco `.dark { ... }`
- **Landing específico**: use classes Tailwind diretamente (ex: `from-rose-50`, `text-rose-600`)

Para mudar a cor primária de rose para violet, pesquise/substitua `rose-` por `violet-` nos arquivos de landing e login.

### Como funciona o Dark Mode
- **Provider**: `components/theme-provider.tsx` — wrapa o layout com `next-themes`
- **Configuração**: `app/layout.tsx` — `attribute="class"` faz next-themes adicionar `.dark` ao `<html>`
- **Toggle**: `components/layout/theme-toggle.tsx` — botão sol/lua
  - Na landing: inserido no header (`app/_components/landing-header.tsx`)
  - No dashboard: inserido no sidebar (`components/layout/sidebar.tsx`)
  - Na tela de login: canto superior direito
- **CSS**: Tailwind v4 com `@custom-variant dark (&:is(.dark *))` — use classes `dark:bg-gray-900 dark:text-white` normalmente
- **Default**: `defaultTheme="system"` — respeita preferência do sistema operacional

---

## Decisões de UX/Arquitetura

- **Mobile-first**: sidebar oculta no mobile, bottom nav visível
- **Multi-tenant desde o início**: tudo isolado por `workspaceId`
- **Auto-criação de workspace**: no primeiro registro, workspace é criado automaticamente
- **Plano Free com limites**: contadores mensais em `UsageCounter`
- **Server Actions**: CRUD simples usa Server Actions (sem API route desnecessária)
- **IDOR protection**: todas queries filtram por `workspaceId` e verificam membership

> TODO: Adicionar suporte a múltiplos workspaces (workspace switcher)
> TODO: Relatórios PDF exportáveis
> TODO: Integração com Instagram para publicar preços
