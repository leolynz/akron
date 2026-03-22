import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { checkUsageLimit } from '@/lib/plan-limits'

const CreateAlertSchema = z.object({
  workspaceId: z.string(),
  canal: z.enum(['META', 'GOOGLE', 'TIKTOK', 'LINKEDIN']),
  campanhaId: z.string(),
  tipo: z.string(),
  diagnostico: z.string(),
  impactoProjetado: z.string().optional(),
  prioridade: z.number().int().min(0).max(10).default(0),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const canal = searchParams.get('canal')
  const clusterId = searchParams.get('clusterId')

  const alerts = await prisma.alert.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as 'NOVO' | 'APLICADO' | 'IGNORADO' } : {}),
      ...(canal ? { canal: canal as 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN' } : {}),
    },
    orderBy: [{ prioridade: 'desc' }, { criadoEm: 'desc' }],
    take: 50,
  })

  return NextResponse.json(alerts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Checar limite de alertas
  const activeAlertsCount = await prisma.alert.count({
    where: { userId: user.id, status: 'NOVO' },
  })
  const { allowed, reason } = checkUsageLimit(user, 'alertas', activeAlertsCount)
  if (!allowed) return NextResponse.json({ error: reason }, { status: 403 })

  const body = CreateAlertSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const alert = await prisma.alert.create({
    data: { ...body.data, userId: user.id },
  })

  return NextResponse.json(alert, { status: 201 })
}
