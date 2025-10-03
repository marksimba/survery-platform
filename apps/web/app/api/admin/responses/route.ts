import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const surveyId = searchParams.get('surveyId') || undefined
  const where = surveyId ? { surveyId } : {}
  const responses = await prisma.response.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
    select: { id: true, submittedAt: true, surveyId: true },
  })
  return NextResponse.json({ responses })
}