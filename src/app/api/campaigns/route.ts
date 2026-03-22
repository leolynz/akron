import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  // Get all campanhaIds that belong to this user via their alerts
  const userAlerts = await prisma.alert.findMany({
    where: { userId },
    select: { campanhaId: true, canal: true },
  })

  const campaignMap = new Map(userAlerts.map(a => [a.campanhaId, a.canal]))
  const campanhaIds = [...campaignMap.keys()]

  if (campanhaIds.length === 0) {
    return NextResponse.json([])
  }

  // Get last 7 days of metrics for those campaigns
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const metrics = await prisma.metricsStore.findMany({
    where: {
      campanhaId: { in: campanhaIds },
      data: { gte: sevenDaysAgo },
    },
    orderBy: { data: 'desc' },
  })

  // Aggregate per campanhaId
  const aggregated = new Map<string, {
    campanhaId: string
    canal: string
    totalGasto: number
    totalImpressoes: number
    totalCliques: number
    totalConversoes: number
    roasValues: number[]
    cpaValues: number[]
    ctrValues: number[]
    ultimaAtualizacao: Date | null
  }>()

  for (const m of metrics) {
    const key = m.campanhaId
    if (!aggregated.has(key)) {
      aggregated.set(key, {
        campanhaId: m.campanhaId,
        canal: m.canal,
        totalGasto: 0,
        totalImpressoes: 0,
        totalCliques: 0,
        totalConversoes: 0,
        roasValues: [],
        cpaValues: [],
        ctrValues: [],
        ultimaAtualizacao: null,
      })
    }
    const agg = aggregated.get(key)!
    agg.totalGasto += m.gasto
    agg.totalImpressoes += m.impressoes
    agg.totalCliques += m.cliques
    agg.totalConversoes += m.conversoes
    agg.roasValues.push(m.roas)
    agg.cpaValues.push(m.cpa)
    agg.ctrValues.push(m.ctr)
    if (!agg.ultimaAtualizacao || m.data > agg.ultimaAtualizacao) {
      agg.ultimaAtualizacao = m.data
    }
  }

  // For campaigns with no recent metrics, still include them with zeros
  for (const [campanhaId, canal] of campaignMap.entries()) {
    if (!aggregated.has(campanhaId)) {
      aggregated.set(campanhaId, {
        campanhaId,
        canal,
        totalGasto: 0,
        totalImpressoes: 0,
        totalCliques: 0,
        totalConversoes: 0,
        roasValues: [],
        cpaValues: [],
        ctrValues: [],
        ultimaAtualizacao: null,
      })
    }
  }

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const result = [...aggregated.values()]
    .map(agg => ({
      campanhaId: agg.campanhaId,
      canal: agg.canal,
      nome: agg.campanhaId,
      gasto: agg.totalGasto,
      roas: parseFloat(avg(agg.roasValues).toFixed(2)),
      cpa: parseFloat(avg(agg.cpaValues).toFixed(2)),
      ctr: parseFloat(avg(agg.ctrValues).toFixed(2)),
      impressoes: agg.totalImpressoes,
      cliques: agg.totalCliques,
      conversoes: agg.totalConversoes,
      ultimaAtualizacao: agg.ultimaAtualizacao
        ? agg.ultimaAtualizacao.toISOString().split('T')[0]
        : null,
    }))
    .sort((a, b) => b.gasto - a.gasto)

  return NextResponse.json(result)
}
