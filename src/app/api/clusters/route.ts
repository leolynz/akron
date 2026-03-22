import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { checkUsageLimit } from '@/lib/plan-limits'

const CreateClusterSchema = z.object({
  workspaceId: z.string(),
  nome: z.string().min(1).max(100),
  campanhas: z.array(z.string()),
})

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clusters = await prisma.cluster.findMany({
    where: { criadoPor: session.user.id },
    orderBy: { criadoEm: 'desc' },
  })

  return NextResponse.json(clusters)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { allowed, reason } = checkUsageLimit(user, 'clusters')
  if (!allowed) return NextResponse.json({ error: reason }, { status: 403 })

  const body = CreateClusterSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const cluster = await prisma.cluster.create({
    data: { ...body.data, criadoPor: session.user.id },
  })

  return NextResponse.json(cluster, { status: 201 })
}
