import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { checkUsageLimit } from '@/lib/plan-limits'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { allowed } = checkUsageLimit(user, 'executionLog')
  if (!allowed) return NextResponse.json({ error: 'Upgrade to PRO for full execution log' }, { status: 403 })

  const logs = await prisma.executionLog.findMany({
    where: { userId: session.user.id },
    include: { action: { include: { alert: true } } },
    orderBy: { criadoEm: 'desc' },
    take: 100,
  })

  return NextResponse.json(logs)
}
