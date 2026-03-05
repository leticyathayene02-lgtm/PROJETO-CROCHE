# PRD — Ateliê Digital (PROJETO CROCHÊ)

**Versão:** 0.1-MVP
**Data:** Março 2026
**Status:** Em desenvolvimento

---

## 1. Visão do Produto

**Problema:** Crocheteiras que vendem peças artesanais frequentemente precificam de forma intuitiva, sem calcular custos reais. Isso leva a margens negativas, falta de controle financeiro e desmotivação.

**Solução:** Um SaaS mobile-first, simples e feminino que ajuda crocheteiras a:
- Calcular o preço justo de cada peça
- Controlar receitas e despesas mensais
- Monitorar o estoque de fios
- Acompanhar o lucro real

**Público-alvo:** Crocheteiras brasileiras que vendem peças artesanais (Instagram, WhatsApp, feiras).

---

## 2. Personas

### Letícia, 28 anos
- Vende crochê como renda extra
- Usa Instagram para divulgar
- Precifica "no feeling"
- Não sabe se está lucrando de verdade

### Ana, 42 anos
- Vende crochê como renda principal
- Tem ateliê em casa
- Já tentou planilha Excel mas desistiu
- Quer algo simples no celular

---

## 3. Funcionalidades MVP

### 3.1 Auth + Workspace
- Login via Google (OAuth)
- Criação automática de workspace (ateliê) no primeiro acesso
- Middleware protege /app/**

### 3.2 Calculadora de Preço (CORE)
**Inputs:**
- Custo do fio (R$/grama × gramas usadas)
- Embalagem, mimo, etiquetas/aviamentos (R$ cada)
- Horas gastas × valor/hora (R$)
- Taxa maquininha (%)
- Margem de lucro desejada (%)

**Outputs (em tempo real):**
- Custo de materiais
- Custo de mão de obra
- Taxas (maquininha)
- Lucro esperado (R$)
- **Preço sugerido de venda**

**Regra de cálculo:**
```
materialsCost = yarnCost + packaging + gift + labels
laborCost = hours × hourlyRate
subtotal = materialsCost + laborCost
fees = subtotal × (cardFeePercent / 100)
profit = (subtotal + fees) × (profitMarginPercent / 100)
suggestedPrice = subtotal + fees + profit
```

### 3.3 Produtos
- CRUD de produto com nome, descrição, status
- Variante simples: cor, tamanho, SKU, preço
- Vinculação opcional a um cálculo de preço

### 3.4 Financeiro
- Lançamento de entradas/saídas com categoria, data, valor, notas
- Resumo mensal: total entradas, saídas, lucro
- Metas mensais (receita e lucro)
- Gráfico dos últimos 6 meses (Recharts BarChart)

### 3.5 Estoque de Fios
- Cadastro: marca, linha, cor, gramas disponíveis, custo total
- Alerta visual de estoque baixo (< threshold configurável, padrão 50g)

### 3.6 Planos e Billing
| Recurso | Grátis | Premium |
|---|---|---|
| Cálculos/mês | 10 | Ilimitado |
| Transações/mês | 20 | Ilimitado |
| Produtos | 10 | Ilimitado |
| Metas mensais | ✓ | ✓ |
| Histórico completo | ✓ | ✓ |

**Preço Premium:** R$ 29,90/mês (via Stripe)

---

## 4. Modelo de Dados (resumo)

Ver `prisma/schema.prisma` para o schema completo.

Entidades principais:
- `User` → `Workspace` (1:N via `WorkspaceMember`)
- `Workspace` → `Subscription` (1:1)
- `Workspace` → `UsageCounter` (1:N, por mês)
- `Workspace` → `PriceCalculation` (1:N)
- `Workspace` → `Product` → `ProductVariant`
- `Workspace` → `Transaction`
- `Workspace` → `Yarn`
- `Workspace` → `MonthlyGoal` (1:N, por mês)

---

## 5. UX Guidelines

- **Mobile-first**: bottom nav no mobile, sidebar no desktop
- **Cores**: Rose/pink como primário, tons neutros (gray) como secundário
- **Tom**: Acolhedor, feminino, sem jargão técnico
- **Feedback**: Toasts para ações, estados de loading em botões
- **Empty states**: Sempre com CTA para criar o primeiro item

---

## 6. Segurança

- Todas as queries filtram por `workspaceId`
- Membership verificada em toda Server Action (`requireWorkspace`)
- Middleware bloqueia /app/** sem sessão
- Webhook Stripe validado com assinatura
- Sem exposição de IDs de outros usuários (IDOR protection)

---

## 7. Roadmap Pós-MVP

- [ ] Magic link (email) além de Google
- [ ] Workspace switcher (múltiplos ateliês)
- [ ] Export PDF de cálculos e relatórios
- [ ] Integração com catálogo do Instagram
- [ ] App mobile nativo (React Native)
- [ ] Calculadora de frete
- [ ] Agenda de pedidos
- [ ] Dashboard de clientes/encomendas

---

## 8. Decisões Técnicas

| Decisão | Escolha | Alternativa considerada | Motivo |
|---|---|---|---|
| Auth | NextAuth v5 + Google | Clerk | Open source, sem vendor lock |
| DB | PostgreSQL | MySQL, SQLite | Robusto, suporte JSON, full-text |
| ORM | Prisma | Drizzle | DX superior, migrations automáticas |
| UI | shadcn/ui | Chakra, MUI | Headless, customizável, TW-native |
| Payments | Stripe | Pagar.me | Referência mundial, webhook confiável |
| Charts | Recharts | Chart.js | Nativo React, menor bundle |
| State | Server Actions + RHF | Redux, Zustand | Sem over-engineering para CRUD |

---

*Documento vivo — atualizar conforme decisões são tomadas.*
