import { NextResponse } from 'next/server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const surveyId = searchParams.get('surveyId')
  if (!surveyId) {
    return new Response('surveyId is required', { status: 400 })
  }

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: { orderBy: { order: 'asc' } } },
  })
  if (!survey) return new Response('not found', { status: 404 })

  const responses = await prisma.response.findMany({
    where: { surveyId },
    include: { items: true },
    orderBy: { submittedAt: 'asc' },
  })

  const headers = ['responseId', 'submittedAt', ...survey.questions.map((q) => q.title)]
  const rows = [headers]

  for (const r of responses) {
    const byQ = new Map(r.items.map((it) => [it.questionId, it.value]))
    const row = [r.id, r.submittedAt.toISOString(), ...survey.questions.map((q) => serialize(byQ.get(q.id))) ]
    rows.push(row)
  }

  function serialize(v: any) {
    if (Array.isArray(v)) return v.join('; ')
    if (v && typeof v === 'object') return JSON.stringify(v)
    return v ?? ''
  }
    ['responseId', 'questionId', 'value'],
    ['r1', 'q1', 'Alice'],
    ['r1', 'q2', 'alice@example.com'],
    ['r2', 'q1', 'Bob'],
    ['r2', 'q2', 'bob@example.com'],
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="responses.csv"',
    },
  })
}