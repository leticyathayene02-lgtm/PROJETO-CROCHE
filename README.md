# 🧶 Trama Pro

Plataforma #1 para artesãs brasileiras. Precificação profissional, pedidos, clientes, estoque e finanças — tudo em um só lugar.

## Stack

- **Next.js 15** (App Router) + TypeScript + Turbopack
- **TailwindCSS v4** + shadcn/ui + Lucide icons
- **PostgreSQL** + **Prisma 7** ORM (adapter-pg)
- **Auth próprio** — email + senha (bcrypt) + session cookie httpOnly
- **Stripe** — assinatura Premium
- **Zod v4** — validação
- **React Hook Form** — formulários
- **Recharts** — gráficos

---

## Setup Local

### 1. Pré-requisitos

- Node.js 20+
- PostgreSQL local **ou** use o `embedded-postgres` embutido (dev only)

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

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL do PostgreSQL |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe |
| `STRIPE_PRICE_ID_PREMIUM` | ID do preço Premium no Stripe |
| `NEXT_PUBLIC_APP_URL` | URL da app (ex: `http://localhost:3000`) |

### 4. Banco de dados

```bash
# Opção A: usar embedded-postgres (dev only)
npm run db:start    # mantenha o terminal aberto

# Opção B: usar PostgreSQL externo — configure DATABASE_URL no .env

# Rodar migrations
npx prisma migrate deploy

# (Opcional) Visualizar dados
npm run db:studio
```

### 5. Iniciar dev

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Criar conta

1. Acesse `/login`
2. Clique na aba "Criar conta"
3. Informe nome (opcional), e-mail e senha (mín. 6 caracteres)
4. Workspace é criado automaticamente → redireciona para `/app/overview`

---

## Deploy (Vercel + Postgres Externo)

### 1. Banco de dados

Use **Neon** (free tier), **Supabase**, ou qualquer PostgreSQL externo. Copie a connection string.

### 2. Deploy na Vercel

1. Importe o repo no Vercel
2. Configure as variáveis de ambiente:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL externo |
| `STRIPE_SECRET_KEY` | Sua chave Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook |
| `STRIPE_PRICE_ID_PREMIUM` | ID do preço |
| `NEXT_PUBLIC_APP_URL` | URL do deploy (ex: `https://trama-pro.vercel.app`) |

3. O build script já roda `prisma generate && next build` automaticamente
4. Após o primeiro deploy, rode as migrations:

```bash
DATABASE_URL="sua_connection_string" npx prisma migrate deploy
```

### 3. Configurar Stripe Webhook (produção)

1. No painel Stripe > Webhooks > Adicionar endpoint
2. URL: `https://seu-dominio.vercel.app/api/stripe/webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copie o signing secret para `STRIPE_WEBHOOK_SECRET`

---

## Módulos

### Motor de Precificação Profissional
- **Materiais múltiplos** com unidade (g, m, un, pct), quantidade e custo
- **Mão de obra por etapa**: produção, acabamento, embalagem (em minutos)
- **Custos fixos (overhead)**: aluguel, internet, energia — rateio automático por hora
- **4 cenários de venda**: À vista, Cartão, Marketplace, Atacado
- **Impostos** (MEI/Simples)
- **Alertas inteligentes**: margem insuficiente, pagando pra trabalhar, valor/hora baixo
- **Preço mínimo** (break-even) exibido

### Catálogo de Materiais
- 11 categorias: fio, enchimento, olhos, etiqueta, botão, zíper, argola, embalagem, tag, mimo, outro
- Custo por unidade, estoque com alerta de baixo estoque
- Fornecedor e notas

### Pedidos & Encomendas
- Kanban de produção: A Fazer → Em Produção → Acabamento → Pronto → Entregue
- Status de pagamento: Não pago → 50% → Pago
- Checklist por pedido + cronômetro de tempo
- Recibo PDF + copiar mensagem WhatsApp

### Clientes
- Cadastro com WhatsApp, Instagram, cidade
- Histórico de pedidos e total gasto

### Financeiro
- Entradas e saídas com categorias
- **DRE Simplificado** por mês (receitas e custos agrupados por categoria)
- Gráfico dos últimos 6 meses
- Metas mensais de receita e lucro

### Estoque de Fios
- Cadastro com marca, linha, cor, gramas e custo
- Alerta automático de estoque baixo

### Planos

| Recurso | Grátis | Premium |
|---|---|---|
| Cálculos/mês | 3 | Ilimitado |
| Transações/mês | 5 | Ilimitado |
| Produtos | 3 | Ilimitado |

---

## Checklist de Release

- [x] Auth (email + senha) funcionando
- [x] Login/registro sem redirect loop
- [x] Dashboard sem tela preta (loading + error boundaries)
- [x] Motor de precificação com cenários
- [x] Catálogo de materiais
- [x] Pedidos com Kanban
- [x] Clientes com histórico
- [x] Financeiro com DRE
- [x] Estoque de fios
- [x] Build passa (`npm run build`)
- [x] Pronto para Vercel (sem `output: standalone`, sem `embedded-postgres` em prod)
- [ ] Configurar Stripe products/prices
- [ ] Configurar domínio customizado
- [ ] Workspace switcher

---

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev com Turbopack |
| `npm run dev:clean` | Limpar cache + dev |
| `npm run build` | Build de produção |
| `npm run db:start` | Iniciar banco embutido |
| `npm run db:generate` | Gerar Prisma Client |
| `npx prisma migrate deploy` | Rodar migrations (produção) |
| `npm run db:studio` | Abrir Prisma Studio |
