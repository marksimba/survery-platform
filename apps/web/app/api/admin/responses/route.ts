import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const surveyId = searchParams.get('surveyId') || undefined
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const where: any = {}
  if (surveyId) where.surveyId = surveyId
  if (from || to) where.submittedAt = {}
  if (from) where.submittedAt.gte = new Date(from)
  if (to) where.submittedAt.lte = new Date(to)
  const responses = await prisma.response.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    select: { id: true, submittedAt: true, surveyId: true },
  })
  return NextResponse.json({ responses })
}