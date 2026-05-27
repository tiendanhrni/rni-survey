import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSurveyById, updateSurvey, deleteSurvey } from '@/lib/sheets'

export async function GET(request, { params }) {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const survey = await getSurveyById(id)
    if (!survey) return NextResponse.json({ error: 'Không tìm thấy.' }, { status: 404 })
    return NextResponse.json(survey)
  } catch (err) {
    console.error('GET survey error:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra.' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const data = await request.json()
    const survey = await updateSurvey(id, data)
    return NextResponse.json(survey)
  } catch (err) {
    console.error('PUT survey error:', err)
    return NextResponse.json({ error: err.message || 'Có lỗi xảy ra.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await deleteSurvey(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE survey error:', err)
    return NextResponse.json({ error: err.message || 'Có lỗi xảy ra.' }, { status: 500 })
  }
}
