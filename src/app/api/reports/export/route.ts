import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 })

  const userId = session.user.id
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') ?? 'alerts'
  const canal = searchParams.get('canal') ?? 'ALL'
  const status = searchParams.get('status') ?? 'all'
  const days = parseInt(searchParams.get('days') ?? '30')

  const since = new Date()
  since.setDate(since.getDate() - days)

  if (type === 'alerts') {
    const where: Record<string, unknown> = { userId, criadoEm: { gte: since } }
    if (canal !== 'ALL') where.canal = canal
    if (status !== 'all') where.status = status

    const alerts = await prisma.alert.findMany({ where, orderBy: { criadoEm: 'desc' } })

    const headers = ['ID', 'Canal', 'Tipo', 'Diagnóstico', 'Impacto Projetado', 'Prioridade', 'Status', 'Data']
    const rows = alerts.map(a => [
      a.id,
      a.canal,
      a.tipo,
      `"${a.diagnostico.replace(/"/g, '""')}"`,
      a.impactoProjetado ?? '',
      a.prioridade,
      a.status,
      a.criadoEm.toLocaleDateString('pt-BR'),
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="akron-alertas-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  if (type === 'campaigns') {
    const userAlerts = await prisma.alert.findMany({ where: { userId }, select: { campanhaId: true, canal: true } })
    const campaignMap = new Map(userAlerts.map(a => [a.campanhaId, a.canal]))
    const campanhaIds = [...campaignMap.keys()]

    const metrics = await prisma.metricsStore.findMany({
      where: { campanhaId: { in: campanhaIds }, data: { gte: since } },
      orderBy: { data: 'desc' },
    })

    // Aggregate by campaign
    const aggregated = new Map<string, { canal: string; gasto: number; impressoes: number; cliques: number; conversoes: number; roasSum: number; cpaSum: number; ctrSum: number; count: number }>()
    for (const m of metrics) {
      const key = m.campanhaId
      const existing = aggregated.get(key) ?? { canal: campaignMap.get(key) ?? m.canal, gasto: 0, impressoes: 0, cliques: 0, conversoes: 0, roasSum: 0, cpaSum: 0, ctrSum: 0, count: 0 }
      existing.gasto += m.gasto
      existing.impressoes += m.impressoes
      existing.cliques += m.cliques
      existing.conversoes += m.conversoes
      existing.roasSum += m.roas
      existing.cpaSum += m.cpa
      existing.ctrSum += m.ctr
      existing.count++
      aggregated.set(key, existing)
    }

    const headers = ['Campanha', 'Canal', 'Gasto (R$)', 'ROAS', 'CPA (R$)', 'CTR (%)', 'Impressões', 'Cliques', 'Conversões']
    const rows = [...aggregated.entries()].map(([id, m]) => [
      id,
      m.canal,
      m.gasto.toFixed(2),
      (m.roasSum / m.count).toFixed(2),
      (m.cpaSum / m.count).toFixed(2),
      (m.ctrSum / m.count).toFixed(2),
      m.impressoes,
      m.cliques,
      m.conversoes,
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="akron-campanhas-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  return new NextResponse('Invalid type', { status: 400 })
}
