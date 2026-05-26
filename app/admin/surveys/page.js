import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { getAllSurveysRaw, deleteSurvey } from '@/lib/sheets'
import DeleteSurveyButton from '@/components/admin/DeleteSurveyButton'

async function logout() {
  'use server'
  const { cookies } = await import('next/headers')
  const { redirect } = await import('next/navigation')
  const cookieStore = await cookies()
  cookieStore.set('admin_token', '', { httpOnly: true, path: '/', maxAge: 0 })
  redirect('/admin')
}

async function handleDelete(id) {
  'use server'
  try {
    await deleteSurvey(id)
  } catch (e) {
    console.error('Delete error:', e)
  }
  revalidatePath('/admin/surveys')
}

export default async function AdminSurveysPage() {
  let surveys = []
  let fetchError = null

  try {
    surveys = await getAllSurveysRaw()
  } catch (err) {
    fetchError = err.message || 'Không thể tải danh sách surveys.'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Học viện RNI</p>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý Surveys</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/surveys/new"
              className="bg-gray-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
            >
              + Tạo survey mới
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 hover:border-gray-400 transition-colors bg-white"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-red-700 mb-1">Không thể kết nối Google Sheets</p>
            <p className="text-sm text-red-600">{fetchError}</p>
          </div>
        )}

        {/* Table */}
        {!fetchError && (
          <>
            {surveys.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-gray-500 text-sm">Chưa có survey nào.</p>
                <Link
                  href="/admin/surveys/new"
                  className="inline-block mt-4 text-sm text-gray-900 underline underline-offset-2"
                >
                  Tạo survey đầu tiên
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Tên survey</th>
                      <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Slug</th>
                      <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">URL</th>
                      <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Trạng thái</th>
                      <th className="text-right px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveys.map((s) => (
                      <tr key={s.id} className={`border-b border-gray-100 last:border-0 ${!s.active ? 'opacity-50' : ''}`}>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{s.title}</p>
                          {s.subtitle && <p className="text-xs text-gray-400 mt-0.5">{s.subtitle}</p>}
                        </td>
                        <td className="px-5 py-4 text-gray-500 font-mono text-xs">{s.slug}</td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/surveys/${s.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:underline text-xs font-mono"
                          >
                            /surveys/{s.slug}
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {s.active ? 'Đang hoạt động' : 'Đã ẩn'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/surveys/${s.id}/edit`}
                              className="text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors"
                            >
                              Sửa
                            </Link>
                            <Link
                              href={`/surveys/${s.slug}`}
                              target="_blank"
                              className="text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-400 transition-colors"
                            >
                              Xem
                            </Link>
                            <DeleteSurveyButton id={s.id} deleteAction={handleDelete} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
