import { prisma } from '@/lib/prisma'
import type { CampaignMetrics } from './google-ads-client'

interface DailyMetrics {
  impressions: number
  clicks: number
  costMicros: number
  conversions: number
  allConversionsValue: number
  ctr: number
  budgetAmountMicros: number
}

function aggregate(rows: CampaignMetrics[]): DailyMetrics {
  return rows.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      costMicros: acc.costMicros + r.costMicros,
      conversions: acc.conversions + r.conversions,
      allConversionsValue: acc.allConversionsValue + r.allConversionsValue,
      ctr: rows.length > 0 ? acc.ctr + r.ctr / rows.length : 0,
      budgetAmountMicros: r.budgetAmountMicros, // último valor
    }),
    { impressions: 0, clicks: 0, costMicros: 0, conversions: 0, allConversionsValue: 0, ctr: 0, budgetAmountMicros: 0 }
  )
}

function roas(m: DailyMetrics): number {
  return m.costMicros > 0 ? m.allConversionsValue / (m.costMicros / 1_000_000) : 0
}

function cpa(m: DailyMetrics): number {
  return m.conversions > 0 ? m.costMicros / 1_000_000 / m.conversions : 0
}

function pct(current: number, previous: number): number {
  if (previous === 0) return 0
  return (current - previous) / previous
}

export interface DetectedAlert {
  campanhaId: string
  tipo: string
  diagnostico: string
  impactoProjetado: string
  prioridade: number
}

export function detectAnomalies(
  campaignId: string,
  campaignName: string,
  recent: CampaignMetrics[],   // últimos 7 dias
  previous: CampaignMetrics[]  // 7 dias anteriores
): DetectedAlert[] {
  const alerts: DetectedAlert[] = []

  if (recent.length === 0) return alerts

  const rec = aggregate(recent)
  const prev = aggregate(previous)

  const roasRecent = roas(rec)
  const roasPrev = roas(prev)
  const cpaRecent = cpa(rec)
  const cpaPrev = cpa(prev)

  // ROAS drop > 20%
  if (roasPrev > 0 && pct(roasRecent, roasPrev) < -0.2) {
    const drop = Math.abs(pct(roasRecent, roasPrev) * 100).toFixed(1)
    alerts.push({
      campanhaId: campaignId,
      tipo: 'ROAS_DROP',
      diagnostico: `Campanha "${campaignName}": ROAS caiu ${drop}% (de ${roasPrev.toFixed(2)} para ${roasRecent.toFixed(2)}) nos últimos 7 dias comparado ao período anterior.`,
      impactoProjetado: `Perda estimada de receita de ${drop}% sobre conversões atuais`,
      prioridade: 3,
    })
  }

  // CPA spike > 30%
  if (cpaPrev > 0 && cpaRecent > 0 && pct(cpaRecent, cpaPrev) > 0.3) {
    const spike = (pct(cpaRecent, cpaPrev) * 100).toFixed(1)
    alerts.push({
      campanhaId: campaignId,
      tipo: 'CPA_SPIKE',
      diagnostico: `Campanha "${campaignName}": CPA aumentou ${spike}% (de R$${cpaPrev.toFixed(2)} para R$${cpaRecent.toFixed(2)}) nos últimos 7 dias.`,
      impactoProjetado: `Custo por conversão ${spike}% acima do período anterior`,
      prioridade: 3,
    })
  }

  // CTR drop > 25%
  if (prev.ctr > 0 && pct(rec.ctr, prev.ctr) < -0.25) {
    const drop = Math.abs(pct(rec.ctr, prev.ctr) * 100).toFixed(1)
    alerts.push({
      campanhaId: campaignId,
      tipo: 'CTR_DROP',
      diagnostico: `Campanha "${campaignName}": CTR caiu ${drop}% (de ${(prev.ctr * 100).toFixed(2)}% para ${(rec.ctr * 100).toFixed(2)}%). Possível fadiga criativa ou perda de relevância.`,
      impactoProjetado: `Queda de ${drop}% em taxa de cliques`,
      prioridade: 2,
    })
  }

  // Budget underutilization < 70%
  if (rec.budgetAmountMicros > 0) {
    const dailyBudget = rec.budgetAmountMicros / 1_000_000
    const avgDailySpend = rec.costMicros / 1_000_000 / Math.max(recent.length, 1)
    const utilization = avgDailySpend / dailyBudget
    if (utilization < 0.7) {
      alerts.push({
        campanhaId: campaignId,
        tipo: 'BUDGET_UNDERUTILIZED',
        diagnostico: `Campanha "${campaignName}": orçamento utilizado em apenas ${(utilization * 100).toFixed(1)}% (média R$${avgDailySpend.toFixed(2)}/dia de R$${dailyBudget.toFixed(2)} disponível).`,
        impactoProjetado: `${((1 - utilization) * 100).toFixed(1)}% do orçamento não utilizado`,
        prioridade: 1,
      })
    }
  }

  return alerts
}

export async function saveAlertsToDb(
  userId: string,
  workspaceId: string,
  detectedAlerts: DetectedAlert[]
): Promise<number> {
  let created = 0
  for (const alert of detectedAlerts) {
    // Evita duplicatas: não cria o mesmo tipo de alerta para a mesma campanha se já existe um NOVO
    const existing = await prisma.alert.findFirst({
      where: {
        userId,
        campanhaId: alert.campanhaId,
        tipo: alert.tipo,
        status: 'NOVO',
        canal: 'GOOGLE',
      },
    })
    if (existing) continue

    await prisma.alert.create({
      data: {
        workspaceId,
        canal: 'GOOGLE',
        campanhaId: alert.campanhaId,
        tipo: alert.tipo,
        diagnostico: alert.diagnostico,
        impactoProjetado: alert.impactoProjetado,
        prioridade: alert.prioridade,
        userId,
      },
    })
    created++
  }
  return created
}
