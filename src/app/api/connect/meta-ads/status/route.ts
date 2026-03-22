import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ connected: false })
  const cred = await prisma.metaAdsCredential.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json({
    connected: !!cred,
    adAccountId: cred?.adAccountId,
    lastSync: cred?.updatedAt?.toISOString(),
  })
}
