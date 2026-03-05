# 🧶 Ateliê Digital — PROJETO CROCHÊ

SaaS para crocheteiras que vendem peças e precisam precificar, organizar estoque e acompanhar lucro.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **TailwindCSS** + shadcn/ui
- **PostgreSQL** + Prisma ORM
- **Auth.js v5** (NextAuth) — Google OAuth
- **Stripe** — assinatura Premium
- **Zod** — validação
- **React Hook Form** — formulários
- **Recharts** — gráficos

---

## Setup Local

### 1. Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou via Docker)
- Conta Google Cloud (para OAuth)
- Conta Stripe (para pagamentos)

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
| `DATABASE_URL` | URL do PostgreSQL |
| `NEXTAUTH_URL` | URL da app (ex: `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret aleatório (gere com `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | ID do OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Secret do OAuth Google |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `STRIPE_PRICE_ID_PREMIUM` | ID do preço no Stripe |

### 4. Banco de dados

```bash
# Criar o banco
createdb projeto_croche

# Rodar migrations
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

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Iniciar desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar lint |
| `npm run format` | Formatar código |
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
├── login/          → Tela de login (Google OAuth)
├── app/            → Dashboard protegido (requer auth)
│   ├── layout.tsx  → Shell com sidebar + mobile nav
│   ├── overview/   → Visão geral + resumo financeiro
│   ├── pricing/    → Calculadora de preço
│   ├── products/   → Catálogo de produtos
│   ├── finance/    → Controle financeiro
│   ├── inventory/  → Estoque de fios
│   └── settings/billing/ → Assinatura
└── api/
    ├── auth/       → NextAuth handlers
    └── stripe/     → Checkout + Webhook

lib/
├── auth.ts         → Auth.js config + auto-create workspace
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

## Deploy (Vercel)

```bash
# Configurar variáveis de ambiente no Vercel Dashboard
# Rodar migrations no banco de produção
npx prisma migrate deploy
```

---

## Decisões de UX/Arquitetura

- **Mobile-first**: sidebar oculta no mobile, bottom nav visível
- **Multi-tenant desde o início**: tudo isolado por `workspaceId`
- **Auto-criação de workspace**: no primeiro login, workspace é criado automaticamente
- **Plano Free com limites**: contadores mensais em `UsageCounter`
- **Server Actions**: CRUD simples usa Server Actions (sem API route desnecessária)
- **IDOR protection**: todas queries filtram por `workspaceId` e verificam membership

> TODO: Adicionar suporte a múltiplos workspaces (workspace switcher)
> TODO: Adicionar email magic link como alternativa ao Google
> TODO: Relatórios PDF exportáveis
> TODO: Integração com Instagram para publicar preços
