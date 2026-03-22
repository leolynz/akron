# Akron

Plataforma de gestão de campanhas multi-canal com detecção automática de problemas, sugestões de otimização com impacto projetado e log auditável de ações.

## Stack

- **Next.js 16** (App Router) + TypeScript strict
- **Tailwind CSS 4** + Design System com tokens semânticos
- **Prisma 6** + PostgreSQL (Neon)
- **Auth.js v5** (Google OAuth + Resend Magic Link)
- **Stripe** (assinaturas + Customer Portal)
- **TanStack Query** (data fetching)
- **Sonner** (toasts)
- **Zod** (validação)

## Setup Local

### 1. Clone e instale dependências

```bash
git clone https://github.com/leolynz/akron
cd akron
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha todas as variáveis:

| Variável | Onde obter |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) — free tier |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → OAuth 2.0 |
| `RESEND_API_KEY` | [resend.com](https://resend.com) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard |
| `STRIPE_PRO_PRICE_ID` | Criar produto "Akron PRO" R$97/mês no Stripe |

### 3. Configure o banco

```bash
# Para .env.local, copie para .env antes do migrate
cp .env.local .env
npx prisma migrate dev
```

### 4. Rode localmente

```bash
npm run dev
```

Acesse http://localhost:3000

### 5. Stripe Webhook local (opcional)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Design System

Tokens centralizados em `design-system/tokens.ts`. Para regenerar CSS:

```bash
npm run tokens
npm run tokens:check
```

## Deploy (Vercel)

1. Conecte o repo no Vercel
2. Configure as variáveis de ambiente no painel
3. Deploy automático em cada push para `main`

## Estrutura

```
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── app/alerts/        # Feed Sentinela
│   │   ├── app/clusters/
│   │   ├── app/clients/
│   │   ├── app/logs/          # Log auditável
│   │   └── settings/billing/
│   ├── api/alerts, actions, clusters, clients, execution-logs, stripe/
│   ├── pricing/
│   └── page.tsx               # Landing page
├── components/ui/             # Button, Card, Badge, Input
├── components/shared/         # Sidebar, TrialBanner, PaywallGate
├── lib/
│   ├── subscription.ts        # isTrialActive, hasAccess, daysLeftInTrial
│   ├── plan-limits.ts         # PLAN_LIMITS, checkUsageLimit
│   └── stripe.ts              # Lazy client, checkout, portal
├── auth.ts                    # Auth.js v5
└── middleware.ts              # Proteção de rotas leve (sem importar Auth.js)
design-system/
├── tokens.ts                  # Single Source of Truth
├── utils.ts
└── generate-css.ts
```
