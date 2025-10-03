import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// Import Prisma client lazily to avoid SSR edge constraints when needed
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SubmissionSchema = z.object({
  items: z.array(
    z.object({
      questionId: z.string(),
      value: z.any(),
    })
  ),
  meta: z.record(z.any()).optional(),
})

export async function POST(req: NextRequest, { params }: { params: { surveyId: string } }) {
  try {
    const surveyId = params.surveyId
    const json = await req.json()
    const parsed = SubmissionSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid submission', issues: parsed.error.issues }, { status: 400 })
    }

    // Ensure survey exists and is published
    const survey = await prisma.survey.findFirst({ where: { id: surveyId, status: 'PUBLISHED' } })
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found or not published' }, { status: 404 })
    }

    // Persist response
    const response = await prisma.response.create({
      data: {
        surveyId,
        meta: parsed.data.meta ?? {},
        items: {
          create: parsed.data.items.map((it) => ({
            questionId: it.questionId,
            value: it.value,
          })),
        },
      },
      include: { items: true },
    })

    // Enqueue webhook event (stub: write event; delivery worker is future work)
    await prisma.outboundEvent.create({
      data: {
        surveyId,
        type: 'submission.created',
        payload: { responseId: response.id },
      },
    })

    return NextResponse.json({ ok: true, id: response.id })
  } catch (err) {
    console.error('Submission error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}