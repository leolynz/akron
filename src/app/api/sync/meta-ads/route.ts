import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getValidMetaToken } from '@/lib/meta-ads-oauth'
import { getMetaCampaignInsights } from '@/lib/meta-ads-client'
import { detectAnomalies, saveAlertsToDb } from '@/lib/alert-detection'

function dateStr(d: Date) { return d.toISOString().split('T')[0] }
function subDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() - n); return x }

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const cred = await prisma.metaAdsCredential.findUnique({ where: { userId } })
  if (!cred) return NextResponse.json({ error: 'Meta Ads not connected' }, { status: 400 })
  if (!cred.adAccountId) return NextResponse.json({ error: 'No Meta ad account found' }, { status: 400 })

  try {
    const accessToken = await getValidMetaToken(userId)
    const today = new Date()
    const recentStart = dateStr(subDays(today, 7))
    const recentEnd = dateStr(subDays(today, 1))
    const prevStart = dateStr(subDays(today, 14))
    const prevEnd = dateStr(subDays(today, 8))

    const [recentMetrics, prevMetrics] = await Promise.all([
      getMetaCampaignInsights(accessToken, cred.adAccountId, recentStart, recentEnd),
      getMetaCampaignInsights(accessToken, cred.adAccountId, prevStart, prevEnd),
    ])

    for (const m of recentMetrics) {
      const roas = m.spend > 0 ? (m.conversions * 100) / m.spend : 0
      const cpa = m.conversions > 0 ? m.spend / m.conversions : 0
      await prisma.metricsStore.upsert({
        where: { canal_campanhaId_data: { canal: 'META', campanhaId: m.campaignId, data: new Date(m.date) } },
        create: { canal: 'META', campanhaId: m.campaignId, data: new Date(m.date), impressoes: m.impressions, cliques: m.clicks, gasto: Math.round(m.spend), conversoes: Math.round(m.conversions), roas, cpa, frequencia: m.frequency, ctr: m.ctr },
        update: { impressoes: m.impressions, cliques: m.clicks, gasto: Math.round(m.spend), conversoes: Math.round(m.conversions), roas, cpa, frequencia: m.frequency, ctr: m.ctr },
      })
    }

    const campaignIds = [...new Set(recentMetrics.map(m => m.campaignId))]
    const allDetected = []
    for (const campaignId of campaignIds) {
      const recent = recentMetrics.filter(m => m.campaignId === campaignId)
      const prev = prevMetrics.filter(m => m.campaignId === campaignId)
      const campaignName = recent[0]?.campaignName ?? campaignId
      // Convert to format expected by detectAnomalies
      const recentConverted = recent.map(m => ({ campaignId: m.campaignId, campaignName: m.campaignName, date: m.date, impressions: m.impressions, clicks: m.clicks, costMicros: m.spend * 1_000_000, conversions: m.conversions, allConversionsValue: m.conversions * 100, ctr: m.ctr, budgetAmountMicros: 0, status: 'ENABLED', budgetId: '', averageCpc: m.cpc * 1_000_000 }))
      const prevConverted = prev.map(m => ({ campaignId: m.campaignId, campaignName: m.campaignName, date: m.date, impressions: m.impressions, clicks: m.clicks, costMicros: m.spend * 1_000_000, conversions: m.conversions, allConversionsValue: m.conversions * 100, ctr: m.ctr, budgetAmountMicros: 0, status: 'ENABLED', budgetId: '', averageCpc: m.cpc * 1_000_000 }))
      const detected = detectAnomalies(campaignId, campaignName, recentConverted, prevConverted)
      allDetected.push(...detected)
    }

    const alertsCreated = await saveAlertsToDb(userId, 'default', allDetected, 'META')
    await prisma.metaAdsCredential.update({ where: { userId }, data: { updatedAt: new Date() } })

    return NextResponse.json({ ok: true, campaignsSynced: campaignIds.length, alertsCreated })
  } catch (err) {
    console.error('Meta sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
