import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { slugify } from '@/lib/slug'

const prisma = new PrismaClient()

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const existing = await prisma.survey.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const base = existing.slug || slugify(existing.title)
  // ensure unique slug
  let slug = base
  let i = 1
  while (await prisma.survey.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }

  const survey = await prisma.survey.update({ where: { id: params.id }, data: { slug, status: 'PUBLISHED' } })
  return NextResponse.json({ survey, permalink: `/s/${survey.slug}` })
}