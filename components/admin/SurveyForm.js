'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Helpers ───────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function genId() {
  return Math.random().toString(36).slice(2, 8)
}

const COLOR_PRESETS = [
  { hex: '#534AB7', label: 'Tím' },
  { hex: '#E8564A', label: 'Đỏ' },
  { hex: '#2D9CDB', label: 'Xanh dương' },
  { hex: '#27AE60', label: 'Xanh lá' },
  { hex: '#F2994A', label: 'Cam' },
]

const QUESTION_TYPES = [
  { value: 'chips', label: 'Chips (chọn nhiều)' },
  { value: 'radio', label: 'Radio (chọn một)' },
  { value: 'scale', label: 'Scale 1-5' },
  { value: 'textarea', label: 'Textarea (văn bản)' },
]

const DEFAULT_QUESTION = (type) => ({
  id: genId(),
  type,
  label: '',
  required: true,
  hint: '',
  options: type === 'chips' || type === 'radio' ? [{ val: genId(), label: '' }] : [],
  scaleMin: type === 'scale' ? 'Không hài lòng' : '',
  scaleMax: type === 'scale' ? 'Rất hài lòng' : '',
  placeholder: type === 'textarea' ? 'Viết ra đây nếu bạn muốn...' : '',
})

// ─── Input components ──────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  )
}

function Input({ label, required, hint, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input
        {...props}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
      />
    </div>
  )
}

function Textarea({ label, required, hint, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea
        {...props}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none"
      />
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

// ─── Question editor ───────────────────────────────────────────────────────

function QuestionEditor({ question, index, total, onChange, onDelete, onMoveUp, onMoveDown }) {
  const updateField = (field, value) => onChange({ ...question, [field]: value })

  const addOption = () => {
    const newOptions = [...(question.options || []), { val: genId(), label: '' }]
    onChange({ ...question, options: newOptions })
  }

  const updateOption = (i, field, value) => {
    const newOptions = question.options.map((o, idx) => idx === i ? { ...o, [field]: value } : o)
    onChange({ ...question, options: newOptions })
  }

  const removeOption = (i) => {
    onChange({ ...question, options: question.options.filter((_, idx) => idx !== i) })
  }

  const typeLabel = QUESTION_TYPES.find(t => t.value === question.type)?.label || question.type

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      {/* Question header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-md px-2 py-1">
            Câu {index + 1}
          </span>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-md px-2 py-1">
            {typeLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            title="Lên"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            title="Xuống"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-400 hover:text-red-600 transition-colors ml-1"
            title="Xóa câu hỏi"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Label */}
      <div className="mb-3">
        <input
          type="text"
          value={question.label}
          onChange={e => updateField('label', e.target.value)}
          placeholder="Nội dung câu hỏi..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Hint */}
      <div className="mb-3">
        <input
          type="text"
          value={question.hint || ''}
          onChange={e => updateField('hint', e.target.value)}
          placeholder="Gợi ý (tùy chọn)..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Type-specific fields */}
      {(question.type === 'chips' || question.type === 'radio') && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Các lựa chọn</p>
          <div className="flex flex-col gap-2">
            {(question.options || []).map((opt, i) => (
              <div key={opt.val} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.label}
                  onChange={e => updateOption(i, 'label', e.target.value)}
                  placeholder={`Lựa chọn ${i + 1}`}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={question.options.length <= 1}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 transition-colors w-full text-left"
            >
              + Thêm lựa chọn
            </button>
          </div>
        </div>
      )}

      {question.type === 'scale' && (
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={question.scaleMin || ''}
              onChange={e => updateField('scaleMin', e.target.value)}
              placeholder="Nhãn mức thấp (1)"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={question.scaleMax || ''}
              onChange={e => updateField('scaleMax', e.target.value)}
              placeholder="Nhãn mức cao (5)"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>
      )}

      {question.type === 'textarea' && (
        <div className="mb-3">
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={e => updateField('placeholder', e.target.value)}
            placeholder="Placeholder của textarea..."
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      )}

      {/* Required toggle */}
      <Toggle
        checked={question.required}
        onChange={v => updateField('required', v)}
        label="Bắt buộc trả lời"
      />
    </div>
  )
}

// ─── Add question dropdown ─────────────────────────────────────────────────

function AddQuestionDropdown({ onAdd }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Thêm câu hỏi
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
          {QUESTION_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                onAdd(t.value)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main SurveyForm component ─────────────────────────────────────────────

export default function SurveyForm({ mode = 'create', initialData = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [slugManuallySet, setSlugManuallySet] = useState(!!initialData?.slug)

  const [form, setForm] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || 'Học viện RNI',
    description: initialData?.description || '',
    estimatedTime: initialData?.estimatedTime || '',
    slug: initialData?.slug || '',
    color: {
      primary: initialData?.color?.primary || '#534AB7',
    },
    questions: initialData?.questions || [],
    thankYouMessage: initialData?.thankYouMessage || '',
    gift: {
      enabled: initialData?.gift?.enabled || false,
      title: initialData?.gift?.title || '',
      description: initialData?.gift?.description || '',
      type: initialData?.gift?.type || 'link',
      value: initialData?.gift?.value || '',
      buttonText: initialData?.gift?.buttonText || 'Nhận quà ngay',
    },
  })

  const setField = (path, value) => {
    setForm(prev => {
      const parts = path.split('.')
      if (parts.length === 1) return { ...prev, [path]: value }
      if (parts.length === 2) return { ...prev, [parts[0]]: { ...prev[parts[0]], [parts[1]]: value } }
      return prev
    })
  }

  const handleTitleChange = (value) => {
    setField('title', value)
    if (!slugManuallySet) {
      setField('slug', slugify(value))
    }
  }

  const handleSlugChange = (value) => {
    const safeSlug = slugify(value) || value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setField('slug', safeSlug)
    setSlugManuallySet(true)
  }

  const addQuestion = (type) => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, DEFAULT_QUESTION(type)],
    }))
  }

  const updateQuestion = (index, updated) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? updated : q),
    }))
  }

  const deleteQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const moveQuestion = (index, direction) => {
    setForm(prev => {
      const qs = [...prev.questions]
      const target = index + direction
      if (target < 0 || target >= qs.length) return prev
      ;[qs[index], qs[target]] = [qs[target], qs[index]]
      return { ...prev, questions: qs }
    })
  }

  // Normalize options: auto-generate val from label if empty
  const normalizeQuestions = (questions) =>
    questions.map(q => ({
      ...q,
      options: (q.options || []).map(o => ({
        ...o,
        val: o.val || slugify(o.label) || genId(),
        label: o.label,
      })),
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) return setError('Vui lòng nhập tiêu đề survey.')
    if (!form.slug.trim()) return setError('Vui lòng nhập slug.')

    setLoading(true)
    try {
      const payload = {
        ...form,
        questions: normalizeQuestions(form.questions),
      }

      const url = mode === 'create'
        ? '/api/admin/surveys'
        : `/api/admin/surveys/${initialData.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra.')
      router.push('/admin/surveys')
    } catch (e) {
      setError(e.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Section 1: Thông tin cơ bản */}
      <SectionCard title="Thông tin cơ bản">
        <Input
          label="Tiêu đề survey"
          required
          value={form.title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Ví dụ: Khảo sát sức khỏe tinh thần"
        />
        <Input
          label="Subtitle / Tổ chức"
          value={form.subtitle}
          onChange={e => setField('subtitle', e.target.value)}
          placeholder="Học viện RNI"
        />
        <Textarea
          label="Mô tả / Lời giới thiệu"
          rows={3}
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          placeholder="Đôi lời gửi đến người tham gia khảo sát..."
        />
        <Input
          label="Thời gian ước tính"
          value={form.estimatedTime}
          onChange={e => setField('estimatedTime', e.target.value)}
          placeholder="3 phút"
        />
        <div>
          <Label>Slug (URL)</Label>
          <p className="text-xs text-gray-400 mb-1.5">Dùng trong đường link: /surveys/<strong>{form.slug || 'ten-survey'}</strong></p>
          <input
            type="text"
            value={form.slug}
            onChange={e => handleSlugChange(e.target.value)}
            placeholder="ten-survey"
            pattern="[a-z0-9-]+"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors font-mono"
          />
        </div>

        {/* Color picker */}
        <div>
          <Label>Màu chủ đạo</Label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="color"
              value={form.color.primary}
              onChange={e => setField('color.primary', e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={form.color.primary}
              onChange={e => setField('color.primary', e.target.value)}
              placeholder="#534AB7"
              className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
            />
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setField('color.primary', c.hex)}
                  title={c.label}
                  className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: form.color.primary === c.hex ? '#111' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Câu hỏi */}
      <SectionCard title="Câu hỏi">
        {form.questions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Chưa có câu hỏi nào. Thêm câu hỏi đầu tiên bên dưới.</p>
        )}
        {form.questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={i}
            total={form.questions.length}
            onChange={updated => updateQuestion(i, updated)}
            onDelete={() => deleteQuestion(i)}
            onMoveUp={() => moveQuestion(i, -1)}
            onMoveDown={() => moveQuestion(i, 1)}
          />
        ))}
        <AddQuestionDropdown onAdd={addQuestion} />
      </SectionCard>

      {/* Section 3: Lời cảm ơn */}
      <SectionCard title="Lời cảm ơn">
        <Textarea
          label="Tin nhắn cảm ơn"
          rows={3}
          value={form.thankYouMessage}
          onChange={e => setField('thankYouMessage', e.target.value)}
          placeholder="Cảm ơn bạn đã dành thời gian chia sẻ..."
        />
      </SectionCard>

      {/* Section 4: Quà tặng */}
      <SectionCard title="Quà tặng (tùy chọn)">
        <Toggle
          checked={form.gift.enabled}
          onChange={v => setField('gift.enabled', v)}
          label="Có quà tặng cho người hoàn thành"
        />

        {form.gift.enabled && (
          <>
            <Input
              label="Tiêu đề quà"
              value={form.gift.title}
              onChange={e => setField('gift.title', e.target.value)}
              placeholder="Ví dụ: Tài liệu miễn phí"
            />
            <Textarea
              label="Mô tả quà"
              rows={2}
              value={form.gift.description}
              onChange={e => setField('gift.description', e.target.value)}
              placeholder="Mô tả ngắn về quà tặng..."
            />
            <div>
              <Label>Loại quà</Label>
              <div className="flex gap-3">
                {[
                  { value: 'link', label: 'Link (URL)' },
                  { value: 'code', label: 'Mã code' },
                ].map(t => (
                  <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gift_type"
                      value={t.value}
                      checked={form.gift.type === t.value}
                      onChange={() => setField('gift.type', t.value)}
                      className="accent-gray-900"
                    />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Input
              label={form.gift.type === 'link' ? 'URL quà tặng' : 'Mã code'}
              value={form.gift.value}
              onChange={e => setField('gift.value', e.target.value)}
              placeholder={form.gift.type === 'link' ? 'https://...' : 'RNICODE2024'}
            />
            <Input
              label="Text nút nhận quà"
              value={form.gift.buttonText}
              onChange={e => setField('gift.buttonText', e.target.value)}
              placeholder="Nhận quà ngay"
            />
          </>
        )}
      </SectionCard>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/surveys')}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 hover:border-gray-400 transition-colors bg-white"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white text-sm font-medium rounded-lg px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Đang lưu...'
            : mode === 'create' ? 'Tạo survey' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  )
}
