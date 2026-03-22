import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getValidToken } from '@/lib/google-ads-oauth'
import { getCampaignMetrics } from '@/lib/google-ads-client'
import { detectAnomalies, saveAlertsToDb } from '@/lib/alert-detection'

function dateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function subDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const cred = await prisma.googleAdsCredential.findUnique({ where: { userId } })
  if (!cred) return NextResponse.json({ error: 'Google Ads not connected' }, { status: 400 })
  if (!cred.customerId) return NextResponse.json({ error: 'No Google Ads account selected' }, { status: 400 })

  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    return NextResponse.json({ error: 'GOOGLE_ADS_DEVELOPER_TOKEN not configured' }, { status: 500 })
  }

  try {
    const accessToken = await getValidToken(userId)

    const today = new Date()
    // Período recente: últimos 7 dias
    const recentStart = dateStr(subDays(today, 7))
    const recentEnd = dateStr(subDays(today, 1))
    // Período anterior: 8-14 dias atrás
    const prevStart = dateStr(subDays(today, 14))
    const prevEnd = dateStr(subDays(today, 8))

    const [recentMetrics, prevMetrics] = await Promise.all([
      getCampaignMetrics(accessToken, cred.customerId, cred.loginCustomerId, recentStart, recentEnd),
      getCampaignMetrics(accessToken, cred.customerId, cred.loginCustomerId, prevStart, prevEnd),
    ])

    // Salva métricas recentes no MetricsStore
    for (const m of recentMetrics) {
      const gasto = Math.round(m.costMicros / 1_000_000)
      const conversoes = Math.round(m.conversions)
      const roas = m.costMicros > 0 ? m.allConversionsValue / (m.costMicros / 1_000_000) : 0
      const cpa = m.conversions > 0 ? m.costMicros / 1_000_000 / m.conversions : 0

      await prisma.metricsStore.upsert({
        where: { canal_campanhaId_data: { canal: 'GOOGLE', campanhaId: m.campaignId, data: new Date(m.date) } },
        create: {
          canal: 'GOOGLE',
          campanhaId: m.campaignId,
          data: new Date(m.date),
          impressoes: m.impressions,
          cliques: m.clicks,
          gasto,
          conversoes,
          roas,
          cpa,
          frequencia: 0,
          ctr: m.ctr,
        },
        update: {
          impressoes: m.impressions,
          cliques: m.clicks,
          gasto,
          conversoes,
          roas,
          cpa,
          ctr: m.ctr,
        },
      })
    }

    // Agrupa por campanha e detecta anomalias
    const campaignIds = [...new Set(recentMetrics.map(m => m.campaignId))]
    const allDetected = []
    for (const campaignId of campaignIds) {
      const recent = recentMetrics.filter(m => m.campaignId === campaignId)
      const prev = prevMetrics.filter(m => m.campaignId === campaignId)
      const campaignName = recent[0]?.campaignName ?? campaignId
      const detected = detectAnomalies(campaignId, campaignName, recent, prev)
      allDetected.push(...detected)
    }

    const alertsCreated = await saveAlertsToDb(userId, 'default', allDetected)

    // Atualiza timestamp da última sincronização
    await prisma.googleAdsCredential.update({
      where: { userId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      ok: true,
      campaignsSynced: campaignIds.length,
      metricsStored: recentMetrics.length,
      alertsCreated,
    })
  } catch (err) {
    console.error('Google Ads sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
