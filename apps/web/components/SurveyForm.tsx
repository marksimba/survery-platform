"use client"
import { useMemo, useState } from 'react'

interface Option { id: string; label: string; value: string }
interface Question {
  id: string
  title: string
  type: string
  required: boolean
  options?: Option[]
}

interface Survey {
  id: string
  questions: Question[]
}

export default function SurveyForm({ survey }: { survey: Survey }) {
  const [values, setValues] = useState<Record<string, any>>({})
  const answeredCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      const v = values[q.id]
      if (v === undefined || v === null) return acc
      if (Array.isArray(v)) return acc + (v.length > 0 ? 1 : 0)
      return acc + (String(v).trim() !== '' ? 1 : 0)
    }, 0)
  }, [questions, values])
  const [submitting, setSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const questions = survey.questions || []

  function setValue(id: string, v: any) {
    setValues((prev) => ({ ...prev, [id]: v }))
  }

  function validate() {
    for (const q of questions) {
      if (q.required && (values[q.id] === undefined || values[q.id] === '')) {
        return `${q.title} is required`
      }
      if (q.type === 'EMAIL' && values[q.id]) {
        const re = /[^@\s]+@[^@\s]+\.[^@\s]+/
        if (!re.test(String(values[q.id]))) return `Invalid email for "${q.title}"`
      }
      if (q.type === 'NUMBER' && values[q.id] !== undefined && values[q.id] !== '') {
        const n = Number(values[q.id])
        if (Number.isNaN(n)) return `Invalid number for "${q.title}"`
      }
    }
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const err = validate()
    if (err) { setError(err); return }

    setSubmitting(true)
    try {
      const items = questions.map((q) => ({ questionId: q.id, value: values[q.id] ?? '' }))
      const res = await fetch(`/api/surveys/${survey.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Submission failed')
      setSubmittedId(data.id)
    } catch (e: any) {
      setError(e.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedId) {
    return (
      <div className="border rounded p-4 bg-green-50">
        <div className="font-medium">Thank you! Your response has been recorded.</div>
        <div className="text-sm text-gray-700">Confirmation: {submittedId}</div>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-600 rounded" style={{ width: `${Math.round(((answeredCount)/(questions.length || 1))*100)}%` }} />
      </div>
      {error && <div className="border border-red-300 bg-red-50 text-red-800 p-3 rounded">{error}</div>}
      {questions.map((q) => (
        <div key={q.id} className="space-y-1">
          <label className="block font-medium">
            {q.title} {q.required && <span className="text-red-600">*</span>}
          </label>
          <Field q={q} value={values[q.id] ?? ''} onChange={(v) => setValue(q.id, v)} />
        </div>
      ))}
      <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}

function Field({ q, value, onChange }: { q: Question, value: any, onChange: (v: any) => void }) {
  const opts = q.options || []
  switch (q.type) {
    case 'LONG_TEXT':
      return <textarea className="border rounded w-full p-2" rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
    case 'EMAIL':
      return <input type="email" className="border rounded w-full p-2" value={value} onChange={(e) => onChange(e.target.value)} />
    case 'NUMBER':
      return <input type="number" className="border rounded w-full p-2" value={value} onChange={(e) => onChange(e.target.value)} />
    case 'SINGLE_SELECT':
      return (
        <div className="space-y-1">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2">
              <input type="radio" name={q.id} checked={value === o.value} onChange={() => onChange(o.value)} /> {o.label}
            </label>
          ))}
        </div>
      )
    case 'MULTI_SELECT':
      return (
        <div className="space-y-1">
          {opts.map((o) => {
            const arr = Array.isArray(value) ? value as string[] : []
            const checked = arr.includes(o.value)
            return (
              <label key={o.id} className="flex items-center gap-2">
                <input type="checkbox" checked={checked} onChange={(e) => {
                  if (e.target.checked) onChange([...arr, o.value])
                  else onChange(arr.filter((v) => v !== o.value))
                }} /> {o.label}
              </label>
            )
          })}
        </div>
      )
    case 'DROPDOWN':
      return (
        <select className="border rounded w-full p-2" value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select...</option>
          {opts.map((o) => <option key={o.id} value={o.value}>{o.label}</option>)}
        </select>
      )
    case 'DATE':
      return <input type="date" className="border rounded w-full p-2" value={value} onChange={(e) => onChange(e.target.value)} />
    case 'TIME':
      return <input type="time" className="border rounded w-full p-2" value={value} onChange={(e) => onChange(e.target.value)} />
    case 'SHORT_TEXT':
    default:
      return <input type="text" className="border rounded w-full p-2" value={value} onChange={(e) => onChange(e.target.value)} />
  }
}