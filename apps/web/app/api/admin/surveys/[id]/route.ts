import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const survey = await prisma.survey.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: 'asc' } } },
  })
  if (!survey) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ survey })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.status === 'string') data.status = body.status
  const survey = await prisma.survey.update({ where: { id: params.id }, data })
  return NextResponse.json({ survey })
}