'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/surveys', { cache: 'no-store' })
    const data = await res.json()
    setSurveys(data.surveys || [])
  }

  useEffect(() => { load() }, [])

  async function createSurvey(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/surveys', { method: 'POST', body: JSON.stringify({ title }), headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      setTitle('')
      await load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Surveys</h1>

      <form onSubmit={createSurvey} className="flex gap-2">
        <input className="border rounded px-3 py-2 w-80" placeholder="Survey title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading || !title.trim()}>
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      <ul className="space-y-2">
        {surveys.map((s) => (
          <li key={s.id} className="border p-3 rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-gray-600">Status: {s.status} {s.slug ? `(slug: ${s.slug})` : ''}</div>
            </div>
            <Link className="underline text-blue-600" href={`/admin/surveys/${s.id}`}>Open</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}