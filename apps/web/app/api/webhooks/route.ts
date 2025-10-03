import { NextRequest, NextResponse } from 'next/server'

// Stub endpoint to list recent webhook events for debugging
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook delivery worker to be implemented in a future phase.',
  })
}