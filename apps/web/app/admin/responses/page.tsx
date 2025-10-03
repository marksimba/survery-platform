'use client'
import { useEffect, useState } from 'react'

export default function ResponsesPage() {
  const [surveys, setSurveys] = useState<any[]>([])
  const [surveyId, setSurveyId] = useState<string>('')
  const [responses, setResponses] = useState<any[]>([])

  async function loadSurveys() {
    const res = await fetch('/api/admin/surveys', { cache: 'no-store' })
    const data = await res.json()
    setSurveys(data.surveys || [])
    if (data.surveys?.[0]?.id) setSurveyId((s: string) => s || data.surveys[0].id)
  }
  let fromDate: string | undefined
  let toDate: string | undefined

  async function loadResponses(id: string) {
    const sp = new URLSearchParams({ surveyId: id })
    if (fromDate) sp.set('from', fromDate)
    if (toDate) sp.set('to', toDate)
    const res = await fetch(`/api/admin/responses?${sp.toString()}`, { cache: 'no-store' })
    const data = await res.json()
    setResponses(data.responses || [])
  }

  useEffect(() => { loadSurveys() }, [])
  useEffect(() => { if (surveyId) loadResponses(surveyId) }, [surveyId])

  function loadResponsesWithDates(from?: string, to?: string) {
    if (from !== undefined) fromDate = from
    if (to !== undefined) toDate = to
    if (surveyId) loadResponses(surveyId)
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Responses</h1>
      <div className="flex items-center gap-2 flex-wrap">
        <select className="border rounded px-2 py-1" value={surveyId} onChange={(e) => setSurveyId(e.target.value)}>
          {surveys.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <label className="text-sm">From <input type="date" className="border rounded px-2 py-1 ml-1" onChange={(e) => loadResponsesWithDates(e.target.value || undefined, undefined)} /></label>
        <label className="text-sm">To <input type="date" className="border rounded px-2 py-1 ml-1" onChange={(e) => loadResponsesWithDates(undefined, e.target.value || undefined)} /></label>
        {surveyId && (
          <a className="underline text-blue-600" href={`/api/export/csv?surveyId=${encodeURIComponent(surveyId)}`}>Download CSV</a>
        )}
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-2 py-1 text-left">ID</th>
            <th className="border px-2 py-1 text-left">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((r) => (
            <tr key={r.id}>
              <td className="border px-2 py-1"><a className="underline text-blue-600" href={`/admin/responses/${r.id}`}>{r.id}</a></td>
              <td className="border px-2 py-1">{new Date(r.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default function ResponsesPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Responses</h1>
      <p className="text-gray-600">Responses dashboard placeholder. CSV export available at /api/export/csv</p>
      <a className="underline text-blue-600" href="/api/export/csv">Download CSV</a>
    </main>
  )
}