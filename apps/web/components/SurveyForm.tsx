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

  // Simple pagination: split by PAGE_BREAK
  const pages: string[][] = useMemo(() => {
    const result: string[][] = [[]]
    for (const q of questions) {
      if (q.type === 'PAGE_BREAK') {
        if (result[result.length - 1].length === 0) continue
        result.push([])
      } else {
        result[result.length - 1].push(q.id)
      }
    }
    return result.filter((p) => p.length > 0)
  }, [questions])
  const [pageIndex, setPageIndex] = useState(0)

  // Visibility based on config.showIf
  function isVisible(q: Question) {
    const cfg: any = (q as any).config || {}
    const rule = cfg.showIf
    if (!rule) return true
    const v = values[rule.questionId]
    if (Array.isArray(v)) return v.includes(rule.equals)
    return (v ?? '') === rule.equals
  }

  const visibleIdsOnPage = (pages[pageIndex] || []).filter((id) => {
    const q = questions.find((x) => x.id === id)!
    return isVisible(q)
  })

  function validatePage() {
    for (const id of visibleIdsOnPage) {
      const q = questions.find((x) => x.id === id)!
      if (q.required) {
        const v = values[id]
        if (v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === '')) {
          return `${q.title} is required`
        }
      }
      if (q.type === 'EMAIL' && values[id]) {
        const re = /[^@\s]+@[^@\s]+\.[^@\s]+/
        if (!re.test(String(values[id]))) return `Invalid email for "${q.title}"`
      }
      if (q.type === 'NUMBER' && values[id] !== undefined && values[id] !== '') {
        const n = Number(values[id])
        if (Number.isNaN(n)) return `Invalid number for "${q.title}"`
      }
    }
    return null
  }

  function setValue(id: string, v: any) {
    setValues((prev) => ({ ...prev, [id]: v }))
  }

  function validateAll() {
    for (let pi = 0; pi < pages.length; pi++) {
      const ids = pages[pi]
      for (const id of ids) {
        const q = questions.find((x) => x.id === id)!
        if (!isVisible(q)) continue
        if (q.required) {
          const v = values[id]
          if (v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === '')) {
            return `${q.title} is required`
          }
        }
        if (q.type === 'EMAIL' && values[id]) {
          const re = /[^@\s]+@[^@\s]+\.[^@\s]+/
          if (!re.test(String(values[id]))) return `Invalid email for "${q.title}"`
        }
        if (q.type === 'NUMBER' && values[id] !== undefined && values[id] !== '') {
          const n = Number(values[id])
          if (Number.isNaN(n)) return `Invalid number for "${q.title}"`
        }
      }
    }
    return null
  }
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
    // If CAPTCHA site key is present, ensure token exists for v2 checkbox
    const siteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY
    if (typeof window !== 'undefined' && siteKey) {
      const tokenEl = document.querySelector('textarea[name="g-recaptcha-response"]') as HTMLTextAreaElement | null
      const token = tokenEl?.value
      if (!token) {
        setError('Please complete the CAPTCHA')
        e.preventDefault()
        return
      }
    }
    e.preventDefault()
    setError(null)
    const err = validateAll()
    if (err) { setError(err); return }

    setSubmitting(true)
    try {
      const items = questions
        .filter((q) => q.type !== 'PAGE_BREAK' && isVisible(q))
        .map((q) => ({ questionId: q.id, value: values[q.id] ?? (q.type === 'MULTI_SELECT' ? [] : '') }))
      let captchaToken: string | undefined
      if (typeof window !== 'undefined') {
        const tokenEl = document.querySelector('textarea[name="g-recaptcha-response"]') as HTMLTextAreaElement | null
        captchaToken = tokenEl?.value || undefined
      }
      const res = await fetch(`/api/surveys/${survey.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, captchaToken }),
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

  function nextPage() {
    const err = validatePage()
    if (err) { setError(err); return }
    setPageIndex((i) => Math.min(i + 1, pages.length - 1))
  }
  function prevPage() {
    setPageIndex((i) => Math.max(i - 1, 0))
  }

  const pagePercent = Math.round(((pageIndex + 1) / (pages.length || 1)) * 100)

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ? (
        <div className="hidden">
          {/* Ensure the reCAPTCHA response field is present if checkbox is used */}
          <textarea name="g-recaptcha-response" readOnly className="hidden"></textarea>
        </div>
      ) : null}
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 bg-blue-600 rounded" style={{ width: `${pagePercent}%` }} />
      </div>
      {error && <div className="border border-red-300 bg-red-50 text-red-800 p-3 rounded">{error}</div>}
      {(pages[pageIndex] || []).map((id) => {
        const q = questions.find((x) => x.id === id)!
        if (!isVisible(q)) return null
        return (
          <div key={id} className="space-y-1">
            <label className="block font-medium">
              {q.title} {q.required && <span className="text-red-600">*</span>}
            </label>
            <Field q={q} value={values[id] ?? (q.type === 'MULTI_SELECT' ? [] : '')} onChange={(v) => setValue(id, v)} />
          </div>
        )
      })}

      <div className="flex items-center gap-2">
        {pageIndex > 0 && <button type="button" className="border px-4 py-2 rounded" onClick={prevPage}>Back</button>}
        {pageIndex < pages.length - 1 ? (
          <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={nextPage}>Next</button>
        ) : (
          <button className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
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