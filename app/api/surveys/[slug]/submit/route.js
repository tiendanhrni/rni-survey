import { NextResponse } from 'next/server'
import { getSurveyBySlug, appendResponse } from '@/lib/sheets'

export async function POST(request, { params }) {
  try {
    const { slug } = await params
    const { answers } = await request.json()

    if (!answers) {
      return NextResponse.json({ error: 'Thiếu dữ liệu.' }, { status: 400 })
    }

    const survey = await getSurveyBySlug(slug)
    if (!survey) {
      return NextResponse.json({ error: 'Không tìm thấy khảo sát.' }, { status: 404 })
    }

    // Validate required questions
    const missing = survey.questions
      .filter(q => q.required)
      .filter(q => {
        const val = answers[q.id]
        return !val || (Array.isArray(val) && val.length === 0) || String(val).trim() === ''
      })

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Vui lòng trả lời: ${missing.map(q => q.label).join(', ')}` },
        { status: 400 }
      )
    }

    await appendResponse(slug, survey.questions, answers)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 })
  }
}
