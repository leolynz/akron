import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ connected: false }, { status: 401 })

  const cred = await prisma.googleAdsCredential.findUnique({
    where: { userId: session.user.id },
    select: { customerId: true, updatedAt: true },
  })

  if (!cred) return NextResponse.json({ connected: false })

  return NextResponse.json({
    connected: true,
    customerId: cred.customerId,
    lastSync: cred.updatedAt.toISOString(),
  })
}
