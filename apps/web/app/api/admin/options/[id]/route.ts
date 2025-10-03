import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.option.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}