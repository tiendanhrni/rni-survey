import { NextResponse } from 'next/server'
import { getSurveyBySlug } from '@/lib/sheets'

export async function GET(request, { params }) {
  try {
    const { slug } = await params
    const survey = await getSurveyBySlug(slug)
    if (!survey) return NextResponse.json({ error: 'Không tìm thấy khảo sát.' }, { status: 404 })
    return NextResponse.json(survey)
  } catch (err) {
    console.error('GET public survey error:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra.' }, { status: 500 })
  }
}
