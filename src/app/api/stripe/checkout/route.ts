import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, stripeCustomerId: true },
  })

  if (!user?.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const checkoutSession = await createCheckoutSession({
    userId: user.id,
    email: user.email,
    customerId: user.stripeCustomerId,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
