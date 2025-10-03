import { NextResponse } from 'next/server'

// Simple CSV export stub
export async function GET() {
  const rows = [
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