import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  })

  return NextResponse.json({ ok: true })
}
