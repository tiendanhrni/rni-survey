import { NextResponse } from 'next/server'
import { createToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Sai mật khẩu.' }, { status: 401 })
    }

    const token = await createToken({ role: 'admin' })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Có lỗi xảy ra.' }, { status: 500 })
  }
}
