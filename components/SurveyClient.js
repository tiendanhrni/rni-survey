'use client'
import { useState } from 'react'

// ─── Question renderers ────────────────────────────────────────────────────

function ChipsQuestion({ question, value = [], onChange, color }) {
  const toggle = (val) =>
    onChange(value.includes(val) ? value.filter(v => v !== val) : [...value, val])
  return (
    <div className="flex flex-wrap gap-2">
      {question.options.map(o => {
        const sel = value.includes(o.val)
        return (
          <button
            key={o.val}
            type="button"
            onClick={() => toggle(o.val)}
            style={sel ? { background: color.light, borderColor: color.primary, color: color.dark } : {}}
            className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-500 cursor-pointer transition-all bg-white hover:border-gray-400"
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function RadioQuestion({ question, value = '', onChange, color }) {
  return (
    <div className="flex flex-col gap-2">
      {question.options.map(o => {
        const sel = value === o.val
        return (
          <button
            key={o.val}
            type="button"
            onClick={() => onChange(o.val)}
            style={sel ? { background: color.light, borderColor: color.primary, color: color.dark } : {}}
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 text-sm text-gray-700 text-left transition-all bg-white hover:border-gray-400"
          >
            <span
              style={sel ? { borderColor: color.primary, background: color.primary } : {}}
              className="mt-0.5 w-4 h-4 rounded-full border border-gray-300 flex-shrink-0 flex items-center justify-center transition-all"
            >
              {sel && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function ScaleQuestion({ question, value = '', onChange, color }) {
  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => {
          const sel = value === String(n)
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              style={sel ? { background: color.light, borderColor: color.primary, color: color.dark } : {}}
              className="w-11 h-11 rounded-xl border border-gray-200 text-sm font-medium bg-white text-gray-500 transition-all hover:border-gray-400"
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{question.scaleMin}</span>
        <span>{question.scaleMax}</span>
      </div>
    </div>
  )
}

function TextareaQuestion({ question, value = '', onChange }) {
  return (
    <textarea
      rows={4}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={question.placeholder || 'Viết ra đây nếu bạn muốn...'}
      className="w-full text-sm text-gray-700 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-gray-400 transition-colors leading-relaxed"
    />
  )
}

// ─── Progress bar ──────────────────────────────────────────────────────────

function ProgressBar({ value, color }) {
  return (
    <div className="w-full h-0.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color.primary }}
      />
    </div>
  )
}

// ─── Gift display ──────────────────────────────────────────────────────────

function GiftBox({ gift, color }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(gift.value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="mt-8 rounded-2xl p-5 border"
      style={{ background: color.light, borderColor: color.primary + '33' }}
    >
      {gift.title && (
        <p className="text-sm font-semibold mb-1" style={{ color: color.dark }}>
          {gift.title}
        </p>
      )}
      {gift.description && (
        <p className="text-sm mb-4" style={{ color: color.dark + 'cc' }}>
          {gift.description}
        </p>
      )}

      {gift.type === 'link' && gift.value && (
        <a
          href={gift.value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: color.primary }}
        >
          {gift.buttonText || 'Nhận quà ngay'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      )}

      {gift.type === 'code' && gift.value && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-base font-bold tracking-widest text-gray-900 text-center">
              {gift.value}
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ background: color.primary }}
            >
              {copied ? 'Đã copy!' : 'Copy'}
            </button>
          </div>
          {gift.buttonText && gift.buttonText !== 'Nhận quà ngay' && (
            <p className="text-xs text-center" style={{ color: color.dark + '99' }}>{gift.buttonText}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export default function SurveyClient({ survey }) {
  const { questions, color, slug } = survey
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (id, val) => setAnswers(p => ({ ...p, [id]: val }))

  // Progress: tính theo số câu đã trả lời / tổng
  const filled = questions.filter(q => {
    const v = answers[q.id]
    if (!v) return false
    if (Array.isArray(v)) return v.length > 0
    return String(v).trim().length > 0
  }).length
  const progress = questions.length > 0 ? Math.round(filled / questions.length * 100) : 0

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/surveys/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
    } catch (e) {
      setError(e.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-16">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: color.light }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 mb-3">Cảm ơn bạn đã tin tưởng chia sẻ</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            {survey.thankYouMessage}
          </p>

          {/* Gift section */}
          {survey.gift?.enabled && (
            <GiftBox gift={survey.gift} color={color} />
          )}

          <p className="text-xs text-gray-400 mt-6">{survey.subtitle}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{survey.subtitle}</p>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">{survey.title}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">{survey.description}</p>
          <p className="text-xs text-gray-400 mt-3 mb-3">
            Khoảng {survey.estimatedTime} · Hoàn toàn ẩn danh
          </p>
          <ProgressBar value={progress} color={color} />
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-medium text-gray-900 mb-1 leading-snug">
                {i + 1}. {q.label}
                {q.required && <span className="text-red-400 ml-1">*</span>}
              </p>
              {q.hint && <p className="text-xs text-gray-400 mb-3">{q.hint}</p>}

              {q.type === 'chips' && (
                <ChipsQuestion question={q} value={answers[q.id] || []} onChange={v => set(q.id, v)} color={color} />
              )}
              {q.type === 'radio' && (
                <RadioQuestion question={q} value={answers[q.id] || ''} onChange={v => set(q.id, v)} color={color} />
              )}
              {q.type === 'scale' && (
                <ScaleQuestion question={q} value={answers[q.id] || ''} onChange={v => set(q.id, v)} color={color} />
              )}
              {q.type === 'textarea' && (
                <TextareaQuestion question={q} value={answers[q.id] || ''} onChange={v => set(q.id, v)} />
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mt-4 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ background: submitting ? '#ccc' : color.primary }}
          className="w-full mt-5 py-3.5 rounded-2xl text-white text-sm font-medium transition-all disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang gửi...' : 'Gửi chia sẻ của tôi'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Thông tin của bạn được bảo mật hoàn toàn.
        </p>
      </div>
    </main>
  )
}
