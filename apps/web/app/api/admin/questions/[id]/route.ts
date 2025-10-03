import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.required === 'boolean') data.required = body.required
  const question = await prisma.question.update({ where: { id: params.id }, data })
  return NextResponse.json({ question })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.question.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}