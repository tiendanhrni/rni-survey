export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getActiveSurveys } from '@/lib/sheets'

export const metadata = {
  title: 'Học viện RNI — Khảo sát',
}

export default async function Home() {
  let surveys = []
  try {
    surveys = await getActiveSurveys()
  } catch {
    // If sheets not configured, show empty state gracefully
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-lg mx-auto">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Học viện RNI</p>
        <h1 className="text-2xl font-medium text-gray-900 mb-8">Các khảo sát</h1>
        {surveys.length === 0 ? (
          <p className="text-sm text-gray-400">Hiện chưa có khảo sát nào.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {surveys.map(s => (
              <Link
                key={s.slug}
                href={`/surveys/${s.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.estimatedTime} · Ẩn danh</p>
                  </div>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-4"
                    style={{ background: s.color.light }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.color.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
