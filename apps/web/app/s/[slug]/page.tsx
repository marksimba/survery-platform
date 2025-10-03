import { PrismaClient } from '@prisma/client'
import SurveyForm from '@/components/SurveyForm'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function SurveyRuntime({ params }: { params: { slug: string } }) {
  const { slug } = params
  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } },
  })

  if (!survey || survey.status !== 'PUBLISHED') {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Survey not found</h1>
        <p className="text-gray-600">This survey does not exist or is not published.</p>
        <p>
          Go back to <Link className="underline text-blue-600" href="/">home</Link>
        </p>
      </main>
    )
  }

  return (
    <main className="p-6 space-y-6 max-w-2xl">
      {process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ? (
        <script async src={`https://www.google.com/recaptcha/api.js`} />
      ) : null}
      <h1 className="text-3xl font-semibold">{survey.title}</h1>
      {survey.description && <p className="text-gray-600">{survey.description}</p>}
      <SurveyForm survey={survey} />
    </main>
  )
}
