import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { checkUsageLimit } from '@/lib/plan-limits'

const CreateClientSchema = z.object({
  workspaceId: z.string(),
  nome: z.string().min(1).max(100),
  metricasRapidas: z.record(z.string(), z.unknown()).optional(),
  canaisConectados: z.array(z.string()),
})

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { criadoEm: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { allowed, reason } = checkUsageLimit(user, 'multiCliente')
  if (!allowed) return NextResponse.json({ error: reason }, { status: 403 })

  const body = CreateClientSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const client = await prisma.client.create({
    data: {
      ...body.data,
      userId: session.user.id,
      metricasRapidas: body.data.metricasRapidas as Prisma.InputJsonValue | undefined,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
