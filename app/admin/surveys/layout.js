import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'

export default async function AdminSurveysLayout({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) {
    redirect('/admin')
  }

  const payload = await verifyToken(token)
  if (!payload) {
    redirect('/admin')
  }

  return <>{children}</>
}
