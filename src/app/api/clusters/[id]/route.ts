import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const PatchClusterSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  campanhas: z.array(z.string()).optional(),
  metaRoas: z.number().nullable().optional(),
  metaCpa: z.number().nullable().optional(),
  metaOrcamento: z.number().nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.cluster.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.criadoPor !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = PatchClusterSchema.safeParse(await req.json())
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 })

  const updated = await prisma.cluster.update({
    where: { id },
    data: body.data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.cluster.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.criadoPor !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.cluster.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
