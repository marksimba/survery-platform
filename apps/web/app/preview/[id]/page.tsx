import { PrismaClient } from '@prisma/client'
import SurveyForm from '@/components/SurveyForm'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const survey = await prisma.survey.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } },
  })

  if (!survey) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Survey not found</h1>
        <p className="text-gray-600">Invalid survey ID.</p>
        <p>
          Go back to <Link className="underline text-blue-600" href="/admin/surveys">Admin</Link>
        </p>
      </main>
    )
  }
  return (
    <main className="p-6 space-y-6 max-w-2xl">
      <div className="text-sm text-orange-600">Preview mode (drafts allowed)</div>
      <h1 className="text-3xl font-semibold">{survey.title}</h1>
      {survey.description && <p className="text-gray-600">{survey.description}</p>}
      <SurveyForm survey={survey} />
    </main>
  )
}