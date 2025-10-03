import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// Import Prisma client lazily to avoid SSR edge constraints when needed
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple in-memory token bucket per IP (resets per process)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 10
const buckets = new Map<string, { tokens: number; resetAt: number }>()

function getIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  // @ts-ignore
  return (req as any).ip || 'unknown'
}

function rateLimit(ip: string) {
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || now > b.resetAt) {
    buckets.set(ip, { tokens: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (b.tokens <= 0) return false
  b.tokens -= 1
  return true
}

async function verifyCaptcha(token?: string) {
  const secret = process.env.CAPTCHA_SECRET_KEY
  if (!secret) return true // not configured
  if (!token) return false
  try {
    // Google reCAPTCHA v2/v3 verify endpoint
    const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString(),
    })
    const json = await resp.json()
    return !!json.success
  } catch {
    return false
  }
}

const SubmissionSchema = z.object({
  items: z.array(
    z.object({
      questionId: z.string(),
      value: z.any(),
    })
  ),
  meta: z.record(z.any()).optional(),
  captchaToken: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { surveyId: string } }) {
  try {
    const surveyId = params.surveyId
    const json = await req.json()
    const parsed = SubmissionSchema.safeParse(json)

    // Rate limiting
    const ip = getIp(req)
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // CAPTCHA verification (optional)
    const captchaOk = await verifyCaptcha(parsed.success ? parsed.data.captchaToken : undefined)
    if (!captchaOk) {
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 })
    }

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