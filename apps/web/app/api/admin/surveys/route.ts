import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, status: true, createdAt: true },
  })
  return NextResponse.json({ surveys })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const title = String(body?.title || '').trim()
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  // Stub owner
  const owner = await prisma.user.upsert({ where: { email: 'owner@example.com' }, update: {}, create: { email: 'owner@example.com', name: 'Owner' } })

  const survey = await prisma.survey.create({ data: { title, ownerId: owner.id, status: 'DRAFT' } })
  return NextResponse.json({ survey })
}