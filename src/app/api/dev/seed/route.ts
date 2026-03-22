import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

function subDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Secret header check
  const seedSecret = process.env.SEED_SECRET ?? 'akron-dev-seed'
  const providedSecret = req.headers.get('x-seed-secret')
  if (providedSecret !== seedSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const userId = session.user.id
  const workspaceId = 'default'

  // Clear existing alerts and metricsStore for this user
  await prisma.alert.deleteMany({ where: { userId } })
  await prisma.metricsStore.deleteMany({
    where: {
      campanhaId: {
        in: ['gads-001', 'gads-002', 'gads-003', 'gads-004', 'meta-001', 'meta-002', 'meta-003', 'meta-004', 'ttk-001', 'ttk-002', 'li-001'],
      },
    },
  })

  // ── Alerts ────────────────────────────────────────────────────────────────

  const now = new Date()

  await prisma.alert.createMany({
    data: [
      // NOVO alerts
      {
        workspaceId,
        canal: 'GOOGLE',
        campanhaId: 'gads-001',
        tipo: 'FADIGA_CRIATIVA',
        diagnostico: "Google Ads: CTR caiu 18% nas últimas 48h na campanha 'Black Friday - Varejo'. Risco de saturação do criativo.",
        impactoProjetado: '-18% CTR',
        prioridade: 3,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        workspaceId,
        canal: 'META',
        campanhaId: 'meta-001',
        tipo: 'CPA_ACIMA_META',
        diagnostico: "Meta Ads: CPA atual (R$ 142) excede o limite do grupo 'Conversão B2B' (Meta: R$ 80). Alto desperdício detectado.",
        impactoProjetado: 'Economia: R$ 620/sem',
        prioridade: 3,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        workspaceId,
        canal: 'GOOGLE',
        campanhaId: 'gads-002',
        tipo: 'ORCAMENTO_SUBUTILIZADO',
        diagnostico: "Google Ads: Campanha 'Brand - Search' está 22% abaixo do ritmo de gasto (Pacing). Alto volume de busca detectado para termos de marca.",
        impactoProjetado: '+22% Alcance Potencial',
        prioridade: 2,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        workspaceId,
        canal: 'TIKTOK',
        campanhaId: 'ttk-001',
        tipo: 'ROAS_ABAIXO_META',
        diagnostico: "TikTok Ads: ROAS atual (2.1x) abaixo da meta do grupo 'Vendas Diretas' (3.0x). Campanha 'Prospecção Video Q1' underperformando.",
        impactoProjetado: '-30% ROAS vs meta',
        prioridade: 3,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        workspaceId,
        canal: 'META',
        campanhaId: 'meta-002',
        tipo: 'FREQUENCIA_ALTA',
        diagnostico: "Meta Ads: Frequência média de 4.8 no segmento 'Lookalike 1%' está causando queda no CTR e aumento no CPM. Público saturado.",
        impactoProjetado: 'Risco: Aumento CPM',
        prioridade: 2,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        workspaceId,
        canal: 'GOOGLE',
        campanhaId: 'gads-003',
        tipo: 'OPORTUNIDADE_LANCE',
        diagnostico: "Google Ads: Campanha 'Shopping - Catálogo Premium' com ROAS de 5.8x acima da meta (3.5x). Orçamento pode ser escalado.",
        impactoProjetado: 'Receita Est.: +R$ 3.2k/sem',
        prioridade: 2,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 7 * 60 * 60 * 1000),
      },
      {
        workspaceId,
        canal: 'LINKEDIN',
        campanhaId: 'li-001',
        tipo: 'CUSTO_POR_LEAD_ALTO',
        diagnostico: "LinkedIn Ads: CPL atual (R$ 380) excede benchmark do segmento 'Decision Makers C-Level' (R$ 220). Segmentação muito ampla.",
        impactoProjetado: 'Economia: R$ 1.1k/sem',
        prioridade: 2,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },
      {
        workspaceId,
        canal: 'META',
        campanhaId: 'meta-003',
        tipo: 'CAMPANHA_PAUSADA_AUTOMATICAMENTE',
        diagnostico: "Meta Ads: Campanha 'Remarketing - Carrinho Abandonado 7d' foi pausada automaticamente por limite de gasto diário atingido às 14h.",
        impactoProjetado: '-100% Impressões',
        prioridade: 3,
        status: 'NOVO',
        userId,
        criadoEm: new Date(now.getTime() - 9 * 60 * 60 * 1000),
      },
      // APLICADO alerts (older)
      {
        workspaceId,
        canal: 'GOOGLE',
        campanhaId: 'gads-004',
        tipo: 'LANCE_AJUSTADO',
        diagnostico: "Bid aumentado 15% na campanha 'Performance Max - E-commerce'.",
        impactoProjetado: '+12% Conversões',
        prioridade: 2,
        status: 'APLICADO',
        userId,
        criadoEm: subDays(now, 3),
      },
      {
        workspaceId,
        canal: 'META',
        campanhaId: 'meta-004',
        tipo: 'ORCAMENTO_AJUSTADO',
        diagnostico: "Orçamento da campanha 'Conversão - Checkout' aumentado em 20%.",
        impactoProjetado: '+R$ 1.8k Receita',
        prioridade: 1,
        status: 'APLICADO',
        userId,
        criadoEm: subDays(now, 4),
      },
      {
        workspaceId,
        canal: 'TIKTOK',
        campanhaId: 'ttk-002',
        tipo: 'CRIATIVO_SUBSTITUIDO',
        diagnostico: 'Criativo com baixo CTR substituído por variante de alto desempenho.',
        impactoProjetado: '+28% CTR',
        prioridade: 1,
        status: 'APLICADO',
        userId,
        criadoEm: subDays(now, 5),
      },
    ],
  })

  // ── MetricsStore ──────────────────────────────────────────────────────────

  // Helper to generate 7 days of daily metrics
  const metricsData: {
    canal: 'GOOGLE' | 'META' | 'TIKTOK' | 'LINKEDIN'
    campanhaId: string
    data: Date
    impressoes: number
    cliques: number
    gasto: number
    conversoes: number
    roas: number
    cpa: number
    frequencia: number
    ctr: number
  }[] = []

  // gads-001: declining CTR (fadiga criativa)
  // cliques: 2500 → 1800 over 7 days, CTR 5% → 3.6%
  const gads001Cliques = [2500, 2380, 2250, 2120, 2000, 1900, 1800]
  const gads001Ctr = [5.0, 4.76, 4.5, 4.24, 4.0, 3.8, 3.6]
  for (let i = 6; i >= 0; i--) {
    const dayIndex = 6 - i
    metricsData.push({
      canal: 'GOOGLE',
      campanhaId: 'gads-001',
      data: subDays(now, i + 1),
      impressoes: 50000,
      cliques: gads001Cliques[dayIndex],
      gasto: 800,
      conversoes: 25,
      roas: 3.2,
      cpa: 32,
      frequencia: 0,
      ctr: gads001Ctr[dayIndex],
    })
  }

  // meta-001: high CPA
  for (let i = 6; i >= 0; i--) {
    metricsData.push({
      canal: 'META',
      campanhaId: 'meta-001',
      data: subDays(now, i + 1),
      impressoes: 80000,
      cliques: 1200,
      gasto: 1200,
      conversoes: 8,
      roas: 2.1,
      cpa: 142,
      frequencia: 2.1,
      ctr: 1.5,
    })
  }

  // gads-002: good performance, underbudget
  for (let i = 6; i >= 0; i--) {
    metricsData.push({
      canal: 'GOOGLE',
      campanhaId: 'gads-002',
      data: subDays(now, i + 1),
      impressoes: 30000,
      cliques: 900,
      gasto: 400,
      conversoes: 45,
      roas: 5.8,
      cpa: 9,
      frequencia: 0,
      ctr: 3.0,
    })
  }

  // meta-002: high frequency, declining
  const meta002Freq = [2.8, 3.2, 3.6, 4.0, 4.3, 4.6, 4.8]
  const meta002Ctr = [1.2, 1.1, 1.0, 0.95, 0.85, 0.8, 0.75]
  for (let i = 6; i >= 0; i--) {
    const dayIndex = 6 - i
    metricsData.push({
      canal: 'META',
      campanhaId: 'meta-002',
      data: subDays(now, i + 1),
      impressoes: 120000,
      cliques: 900,
      gasto: 1500,
      conversoes: 15,
      roas: 2.8,
      cpa: 100,
      frequencia: meta002Freq[dayIndex],
      ctr: meta002Ctr[dayIndex],
    })
  }

  // gads-003: excellent ROAS, opportunity to scale
  for (let i = 6; i >= 0; i--) {
    metricsData.push({
      canal: 'GOOGLE',
      campanhaId: 'gads-003',
      data: subDays(now, i + 1),
      impressoes: 15000,
      cliques: 600,
      gasto: 300,
      conversoes: 52,
      roas: 5.8,
      cpa: 6,
      frequencia: 0,
      ctr: 4.0,
    })
  }

  await prisma.metricsStore.createMany({
    data: metricsData,
    skipDuplicates: true,
  })

  const novosCount = 8
  const aplicadosCount = 3

  return NextResponse.json({
    ok: true,
    alertsCreated: novosCount + aplicadosCount,
    novos: novosCount,
    aplicados: aplicadosCount,
    metricsStored: metricsData.length,
  })
}
