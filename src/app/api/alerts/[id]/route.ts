import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const UpdateAlertSchema = z.object({
  status: z.enum(['NOVO', 'APLICADO', 'IGNORADO']).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = UpdateAlertSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const alert = await prisma.alert.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.alert.update({
    where: { id },
    data: body.data,
  })

  return NextResponse.json(updated)
}
