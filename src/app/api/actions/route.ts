import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const CreateActionSchema = z.object({
  alertId: z.string(),
  tipo: z.enum(['PAUSE', 'BID', 'BUDGET']),
  payload: z.record(z.string(), z.unknown()),
  canal: z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN']),
  metricasAntes: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = CreateActionSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  // Verificar se o alert pertence ao usuário
  const alert = await prisma.alert.findFirst({
    where: { id: body.data.alertId, userId: session.user.id },
  })
  if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 })

  const action = await prisma.action.create({
    data: {
      alertId: body.data.alertId,
      tipo: body.data.tipo,
      payload: body.data.payload as Prisma.InputJsonValue,
      canal: body.data.canal,
      aplicadoPor: session.user.id,
      metricasAntes: body.data.metricasAntes as Prisma.InputJsonValue | undefined,
    },
  })

  // Criar execution log
  await prisma.executionLog.create({
    data: {
      actionId: action.id,
      userId: session.user.id,
      canal: body.data.canal,
      campanha: alert.campanhaId,
      acao: body.data.tipo,
      metricasAntes: body.data.metricasAntes as Prisma.InputJsonValue | undefined,
      status: 'SUCCESS',
    },
  })

  // Marcar alert como APLICADO
  await prisma.alert.update({
    where: { id: body.data.alertId },
    data: { status: 'APLICADO' },
  })

  return NextResponse.json(action, { status: 201 })
}
