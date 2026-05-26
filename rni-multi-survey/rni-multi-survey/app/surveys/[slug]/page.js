import { getSurvey, getAllSlugs } from '@/surveys/index'
import { notFound } from 'next/navigation'
import SurveyClient from '@/components/SurveyClient'

export async function generateStaticParams() {
  return getAllSlugs()
}

export async function generateMetadata({ params }) {
  const survey = getSurvey(params.slug)
  if (!survey) return {}
  return {
    title: `${survey.title} — ${survey.subtitle}`,
    description: survey.description,
  }
}

export default function SurveyPage({ params }) {
  const survey = getSurvey(params.slug)
  if (!survey) notFound()
  return <SurveyClient survey={survey} />
}
