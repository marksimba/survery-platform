'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

function AddOption({ questionId, onAdded }: { questionId: string, onAdded: () => void }) {
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)
  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    setSaving(true)
    try {
      await fetch(`/api/admin/questions/${questionId}/options`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label })
      })
      setLabel('')
      onAdded()
    } finally { setSaving(false) }
  }
  return (
    <form className="flex gap-2 mt-2" onSubmit={add}>
      <input className="border rounded px-2 py-1" placeholder="Add option" value={label} onChange={(e) => setLabel(e.target.value)} />
      <button className="text-sm bg-gray-800 text-white px-3 py-1 rounded disabled:opacity-50" disabled={saving || !label.trim()}>Add</button>
    </form>
  )
}

function VisibilityRule({ question, allQuestions, onSaved }: { question: any; allQuestions: any[]; onSaved: () => void }) {
  const prior = allQuestions.filter((x) => x.order < question.order && x.type !== 'PAGE_BREAK')
  const [enabled, setEnabled] = useState(!!question.config?.showIf)
  const [dep, setDep] = useState<string>(question.config?.showIf?.questionId || (prior[0]?.id || ''))
  const [equals, setEquals] = useState<string>(question.config?.showIf?.equals ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const config = enabled && dep ? { showIf: { questionId: dep, equals } } : {}
      await fetch(`/api/admin/questions/${question.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config }) })
      onSaved()
    } finally { setSaving(false) }
  }

  return (
    <div className="text-sm border rounded p-2 bg-gray-50">
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Show only if</label>
        <select className="border rounded px-2 py-1" value={dep} onChange={(e) => setDep(e.target.value)} disabled={!enabled}>
          {prior.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <span>equals</span>
        <input className="border rounded px-2 py-1" placeholder="value" value={equals} onChange={(e) => setEquals(e.target.value)} disabled={!enabled} />
        <button className="border px-2 py-1 rounded" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
}

export default function BuilderPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [survey, setSurvey] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [qTitle, setQTitle] = useState('')
  const [qType, setQType] = useState('SHORT_TEXT')
  const [qRequired, setQRequired] = useState(false)
  const [pubLink, setPubLink] = useState<string | null>(null)

  async function load() {
    const res = await fetch(`/api/admin/surveys/${id}`, { cache: 'no-store' })
    const data = await res.json()
    setSurvey(data.survey || null)
    setPubLink(null)
  }

  useEffect(() => { load() }, [id])

  async function addQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!qTitle.trim()) return
    setLoading(true)
    try {
      await fetch(`/api/admin/surveys/${id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: qTitle, type: qType, required: qRequired }),
      })
      setQTitle(''); setQRequired(false); setQType('SHORT_TEXT')
      await load()
    } finally { setLoading(false) }
  }

  async function publish() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/surveys/${id}/publish`, { method: 'POST' })
      const data = await res.json()
      setPubLink(data.permalink)
      await load()
    } finally { setLoading(false) }
  }

  async function saveTitle(newTitle: string) {
    await fetch(`/api/admin/surveys/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle }) })
    await load()
  }

  if (!survey) return <main className="p-6">Loading...</main>

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <input className="text-2xl font-semibold border rounded px-2 py-1" defaultValue={survey.title} onBlur={(e) => saveTitle(e.target.value)} />
        <span className="text-sm text-gray-600">Status: {survey.status}</span>
        {survey.slug && <span className="text-sm text-gray-600">Slug: {survey.slug}</span>}
      </div>

      <section>
        <h2 className="font-medium mb-2">Questions</h2>
        <div className="text-sm text-gray-600 mb-2">After publishing, permalink will appear below. You can also preview drafts.</div>
        <ul className="space-y-2">
          {(survey.questions || []).map((q: any) => (
            <li key={q.id} className="border p-3 rounded space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-sm text-gray-600">{q.type} {q.required ? '(required)' : ''}</div>
                </div>
              </div>
              {q.type !== 'PAGE_BREAK' && (
                <VisibilityRule question={q} allQuestions={survey.questions} onSaved={load} />
              )}
              {['SINGLE_SELECT','MULTI_SELECT','DROPDOWN'].includes(q.type) && (
                <div className="pl-2">
                  <div className="text-sm font-medium">Options</div>
                  <ul className="list-disc list-inside text-sm">
                    {(q.options || []).map((opt: any) => (
                      <li key={opt.id} className="flex items-center justify-between">
                        <span>{opt.label}</span>
                        {/* Option delete could be added here */}
                      </li>
                    ))}
                  </ul>
                  <AddOption questionId={q.id} onAdded={load} />
                </div>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={addQuestion} className="mt-4 flex flex-wrap gap-2 items-center">
          <input className="border rounded px-3 py-2 w-80" placeholder="Question title" value={qTitle} onChange={(e) => setQTitle(e.target.value)} />
          <select className="border rounded px-2 py-2" value={qType} onChange={(e) => setQType(e.target.value)}>
            <option value="SHORT_TEXT">Short text</option>
            <option value="LONG_TEXT">Long text</option>
            <option value="EMAIL">Email</option>
            <option value="NUMBER">Number</option>
            <option value="DATE">Date</option>
            <option value="TIME">Time</option>
            <option value="SINGLE_SELECT">Single select</option>
            <option value="MULTI_SELECT">Multi select</option>
            <option value="DROPDOWN">Dropdown</option>
            <option value="FILE_UPLOAD">File upload</option>
            <option value="PAGE_BREAK">Page break</option>
          </select>
          {qType !== 'PAGE_BREAK' && (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={qRequired} onChange={(e) => setQRequired(e.target.checked)} /> Required</label>
          )}
          <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading || !qTitle.trim()}>Add</button>
        </form>
      </section>

      <section className="space-x-2 flex items-center gap-2">
        <button className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50" onClick={publish} disabled={loading}>Publish</button>
        <Link className="underline text-blue-600" href={`/preview/${id}`}>Preview</Link>
        {pubLink && (
          <span className="flex items-center gap-2">
            Published: <Link className="underline text-blue-600" href={pubLink}>{pubLink}</Link>
            <button className="text-sm border px-2 py-1 rounded" onClick={() => navigator.clipboard.writeText(window.location.origin + pubLink)}>Copy link</button>
          </span>
        )}
      </section>
    </main>
  )
}