import Link from 'next/link'
import SurveyForm from '@/components/admin/SurveyForm'

export const metadata = {
  title: 'Tạo survey mới — RNI Admin',
}

export default function NewSurveyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/surveys"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">RNI Admin</p>
            <h1 className="text-2xl font-semibold text-gray-900">Tạo survey mới</h1>
          </div>
        </div>

        <SurveyForm mode="create" />
      </div>
    </main>
  )
}
