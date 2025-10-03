import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const title = String(body?.title || '').trim()
  const type = String(body?.type || '').trim().toUpperCase() as keyof typeof QuestionType
  const required = Boolean(body?.required)
  if (!title || !type || !QuestionType[type]) return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  const count = await prisma.question.count({ where: { surveyId: params.id } })
  const question = await prisma.question.create({
    data: { surveyId: params.id, title, type: QuestionType[type], required, order: count + 1, config: {} },
  })
  return NextResponse.json({ question })
}