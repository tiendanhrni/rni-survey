export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getSurveyBySlug } from '@/lib/sheets'
import SurveyClient from '@/components/SurveyClient'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const survey = await getSurveyBySlug(slug)
  if (!survey) return {}
  return {
    title: `${survey.title} — ${survey.subtitle}`,
    description: survey.description,
  }
}

export default async function SurveyPage({ params }) {
  const { slug } = await params
  const survey = await getSurveyBySlug(slug)
  if (!survey) notFound()
  return <SurveyClient survey={survey} />
}
