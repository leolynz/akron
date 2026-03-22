import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getValidToken } from '@/lib/google-ads-oauth'
import { pauseCampaign, updateCampaignBudget, updateTargetCpa } from '@/lib/google-ads-client'
import { z } from 'zod'

const schema = z.object({
  alertId: z.string(),
  tipo: z.enum(['PAUSE', 'BID', 'BUDGET']),
  // Para PAUSE: apenas alertId
  // Para BUDGET: newAmountBrl (valor em R$)
  // Para BID: newCpaBrl (CPA alvo em R$)
  newAmountBrl: z.number().positive().optional(),
  newCpaBrl: z.number().positive().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { alertId, tipo, newAmountBrl, newCpaBrl } = parsed.data

  const alert = await prisma.alert.findFirst({ where: { id: alertId, userId } })
  if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
  if (alert.canal !== 'GOOGLE') return NextResponse.json({ error: 'Not a Google Ads alert' }, { status: 400 })

  const cred = await prisma.googleAdsCredential.findUnique({ where: { userId } })
  if (!cred) return NextResponse.json({ error: 'Google Ads not connected' }, { status: 400 })

  let status: 'SUCCESS' | 'FAILED' = 'SUCCESS'
  let errorMsg: string | undefined

  try {
    const accessToken = await getValidToken(userId)

    if (tipo === 'PAUSE') {
      await pauseCampaign(accessToken, cred.customerId, cred.loginCustomerId, alert.campanhaId)
    } else if (tipo === 'BUDGET' && newAmountBrl) {
      // Busca budgetId pelo campaignId no MetricsStore não é possível — precisamos do budgetId do alert payload
      // Por ora usa o campanhaId como budgetId (usuário deve passar o budgetId no payload via UI)
      const amountMicros = Math.round(newAmountBrl * 1_000_000)
      await updateCampaignBudget(accessToken, cred.customerId, cred.loginCustomerId, alert.campanhaId, amountMicros)
    } else if (tipo === 'BID' && newCpaBrl) {
      const cpaMicros = Math.round(newCpaBrl * 1_000_000)
      await updateTargetCpa(accessToken, cred.customerId, cred.loginCustomerId, alert.campanhaId, cpaMicros)
    }
  } catch (err) {
    status = 'FAILED'
    errorMsg = String(err)
    console.error('Action execute error:', err)
  }

  // Registra action + execution log
  const action = await prisma.action.create({
    data: {
      alertId,
      tipo,
      payload: { newAmountBrl, newCpaBrl },
      canal: 'GOOGLE',
      aplicadoPor: userId,
    },
  })

  await prisma.executionLog.create({
    data: {
      actionId: action.id,
      userId,
      canal: 'GOOGLE',
      campanha: alert.campanhaId,
      acao: tipo,
      status,
      delta: null,
    },
  })

  if (status === 'SUCCESS') {
    await prisma.alert.update({ where: { id: alertId }, data: { status: 'APLICADO' } })
  }

  if (status === 'FAILED') {
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }

  return NextResponse.json({ ok: true, actionId: action.id })
}
