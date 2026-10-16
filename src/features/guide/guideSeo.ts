import { SITE_URL } from '@/config/seo.config'
import { breadcrumbLd, howToLd } from '@/shared/seo/jsonLd'
import { GROUPS } from './guideContent'

const plain = (text: string) => text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1')

/** Structured data for the guide: the trail, and the step-by-step topics (recipes and "make your first page") as how-tos. */
export function guideLd(full: boolean): object[] {
  const trail = breadcrumbLd(SITE_URL, [['Home', '/'], ['Guide', '/guide'], ...(full ? [['Full guide', '/guide/full'] as [string, string]] : [])])
  if (!full) return [trail]
  const howTos = GROUPS.filter((group) => group.id === 'recipes' || group.id === 'start').flatMap((group) => group.topics).flatMap((topic) => {
    const steps = topic.blocks.find((block) => block.kind === 'steps')
    return steps && steps.kind === 'steps' ? [howToLd(topic.title, topic.summary, steps.items.map(plain))] : []
  })
  return [trail, ...howTos]
}
