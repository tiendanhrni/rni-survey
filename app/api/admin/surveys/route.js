import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getAllSurveysRaw, createSurvey } from '@/lib/sheets'

export async function GET() {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const surveys = await getAllSurveysRaw()
    return NextResponse.json(surveys)
  } catch (err) {
    console.error('GET surveys error:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra.' }, { status: 500 })
  }
}

export async function POST(request) {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await request.json()
    if (!data.slug || !data.title) {
      return NextResponse.json({ error: 'Thiếu title hoặc slug.' }, { status: 400 })
    }
    const survey = await createSurvey(data)
    return NextResponse.json(survey)
  } catch (err) {
    console.error('POST survey error:', err)
    return NextResponse.json({ error: err.message || 'Có lỗi xảy ra.' }, { status: 500 })
  }
}
