import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  return response
}
