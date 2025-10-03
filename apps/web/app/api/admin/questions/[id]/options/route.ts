import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const label = String(body?.label || '').trim()
  const value = String(body?.value || label).trim()
  if (!label) return NextResponse.json({ error: 'label required' }, { status: 400 })
  const count = await prisma.option.count({ where: { questionId: params.id } })
  const option = await prisma.option.create({ data: { questionId: params.id, label, value, order: count + 1 } })
  return NextResponse.json({ option })
}