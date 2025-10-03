import Link from 'next/link'

export default function SurveyRuntime({ params }: { params: { slug: string } }) {
  const { slug } = params
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Survey: {slug}</h1>
      <p className="text-gray-600">Public survey runtime placeholder. Configure your database and create a published survey to enable submissions.</p>
      <p>
        Go back to <Link className="underline text-blue-600" href="/admin">Admin</Link>
      </p>
    </main>
  )
}