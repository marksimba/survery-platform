import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function ResponseDetail({ params }: { params: { id: string } }) {
  const response = await prisma.response.findUnique({
    where: { id: params.id },
    include: {
      survey: { include: { questions: true } },
      items: true,
    },
  })
  if (!response) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Response not found</h1>
        <Link className="underline text-blue-600" href="/admin/responses">Back to responses</Link>
      </main>
    )
  }
  const titleById = new Map(response.survey.questions.map((q) => [q.id, q.title]))

  return (
    <main className="p-6 space-y-4">
      <div className="text-sm text-gray-600">Survey: {response.survey.title}</div>
      <h1 className="text-2xl font-semibold">Response {response.id}</h1>
      <div className="text-sm text-gray-600">Submitted at {response.submittedAt.toISOString()}</div>
      <div className="space-y-2">
        {response.items.map((it) => (
          <div key={it.id} className="border rounded p-2">
            <div className="font-medium">{titleById.get(it.questionId) || it.questionId}</div>
            <pre className="whitespace-pre-wrap text-sm">{formatValue(it.value)}</pre>
          </div>
        ))}
      </div>
      <Link className="underline text-blue-600" href="/admin/responses">Back to responses</Link>
    </main>
  )
}

function formatValue(v: any) {
  if (Array.isArray(v)) return v.join(', ')
  if (v && typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v ?? '')
}