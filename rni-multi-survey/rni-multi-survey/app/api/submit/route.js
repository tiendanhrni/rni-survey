import { NextResponse } from 'next/server'
import { getSurvey } from '@/surveys/index'
import { appendToSheet } from '@/lib/sheets'

export async function POST(request) {
  try {
    const body = await request.json()
    const { slug, answers } = body

    if (!slug || !answers) {
      return NextResponse.json({ error: 'Thiếu dữ liệu.' }, { status: 400 })
    }

    const survey = getSurvey(slug)
    if (!survey) {
      return NextResponse.json({ error: 'Không tìm thấy khảo sát.' }, { status: 404 })
    }

    // Kiểm tra câu hỏi bắt buộc
    const missing = survey.questions
      .filter(q => q.required)
      .filter(q => {
        const val = answers[q.id]
        return !val || (Array.isArray(val) && val.length === 0)
      })

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Vui lòng trả lời: ${missing.map(q => q.label).join(', ')}` },
        { status: 400 }
      )
    }

    await appendToSheet(survey.sheetEnvKey, survey.questions, answers)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 })
  }
}
