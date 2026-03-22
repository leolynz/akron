import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

type Performance = 'DESTAQUE' | 'ESTAVEL' | 'FADIGA'

const avg = (arr: number[]) =>
  arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

const pctDelta = (recent: number, prev: number): number => {
  if (prev === 0) return 0
  return ((recent - prev) / prev) * 100
}

const perfOrder: Record<Performance, number> = {
  DESTAQUE: 0,
  ESTAVEL: 1,
  FADIGA: 2,
}

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

  const since7 = new Date(); since7.setDate(since7.getDate() - 7)
  const since14 = new Date(); since14.setDate(since14.getDate() - 14)

  // Fetch last 14 days of metrics
  const allMetrics = await prisma.metricsStore.findMany({
    where: {
      campanhaId: { in: campanhaIds },
      data: { gte: since14 },
    },
  })

  // Group by campanhaId
  const byCampaign = new Map<string, typeof allMetrics>()
  for (const m of allMetrics) {
    if (!byCampaign.has(m.campanhaId)) byCampaign.set(m.campanhaId, [])
    byCampaign.get(m.campanhaId)!.push(m)
  }

  const results = campanhaIds.map(campanhaId => {
    const canal = campaignMap.get(campanhaId) ?? 'META'
    const metrics = byCampaign.get(campanhaId) ?? []

    const recent = metrics.filter(m => m.data >= since7)
    const prev = metrics.filter(m => m.data >= since14 && m.data < since7)

    const ctrAtual = avg(recent.map(m => m.ctr))
    const ctrPrev = avg(prev.map(m => m.ctr))
    const roasAtual = avg(recent.map(m => m.roas))
    const roaprev = avg(prev.map(m => m.roas))

    const ctrDelta = pctDelta(ctrAtual, ctrPrev)
    const roasDelta = pctDelta(roasAtual, roaprev)

    const gastoTotal = recent.reduce((sum, m) => sum + m.gasto, 0)
    const impressoes7d = recent.reduce((sum, m) => sum + m.impressoes, 0)

    let performance: Performance
    if (ctrDelta > 10) performance = 'DESTAQUE'
    else if (ctrDelta < -10) performance = 'FADIGA'
    else performance = 'ESTAVEL'

    return {
      campanhaId,
      canal,
      ctrAtual: parseFloat(ctrAtual.toFixed(2)),
      ctrDelta: parseFloat(ctrDelta.toFixed(1)),
      roasAtual: parseFloat(roasAtual.toFixed(2)),
      roasDelta: parseFloat(roasDelta.toFixed(1)),
      gastoTotal,
      impressoes7d,
      performance,
    }
  })

  results.sort((a, b) => perfOrder[a.performance] - perfOrder[b.performance])

  return NextResponse.json(results)
}
