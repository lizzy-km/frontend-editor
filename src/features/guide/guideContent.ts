import { ACCESS } from './content/access'
import { CODE } from './content/code'
import { DATA } from './content/data'
import { FORMS } from './content/forms'
import { HELP } from './content/help'
import { INTERACTIVE } from './content/interactive'
import { LOOKS } from './content/looks'
import { RECIPES } from './content/recipes'
import { START } from './content/start'
import { TOUR } from './content/tour'
import { WEBSITE } from './content/website'
import type { Block, Group, Topic } from './guideTypes'

/** The whole guide, in reading order. */
export const GROUPS: Group[] = [START, RECIPES, TOUR, LOOKS, WEBSITE, ACCESS, FORMS, DATA, INTERACTIVE, CODE, HELP]

/** The five steps shown first in the Quick guide, each pointing at its topic. */
export const QUICK_STEPS: { title: string; text: string; topic: string }[] = [
  { title: 'Start', text: 'Open Try it. Paste your AI’s answer, or start with a blank page.', topic: 'first-page' },
  { title: 'Click and change', text: 'Click anything. Words, pictures and colors are under Design on the right.', topic: 'selecting' },
  { title: 'Add pages and a menu', text: 'Make it a website, add pages, then pick a layout under Design → Layout.', topic: 'layouts' },
  { title: 'Check it', text: 'Press Preview. Test Phone size, and see the site as a visitor or an admin.', topic: 'preview' },
  { title: 'Share or download', text: 'Create an account to Share a link, or Download a page, a .zip or a React project.', topic: 'downloads' },
]

export const topicHref = (id: string) => `/guide/full#${id}`

const text = (block: Block): string =>
  block.kind === 'table' ? [...block.head, ...block.rows.flat()].join(' ') : 'items' in block ? block.items.join(' ') : block.kind === 'figure' ? block.caption : block.text

/** Everything a topic says, lowercase, for searching. */
export const searchText = (group: Group, topic: Topic) =>
  [group.title, topic.title, topic.summary, topic.brief, ...topic.blocks.map(text)].join(' ').toLowerCase().replace(/\*\*|`/g, '')

/** The groups with only the topics that contain every word typed. */
export function searchGuide(query: string): Group[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return GROUPS
  return GROUPS.map((group) => ({ ...group, topics: group.topics.filter((topic) => words.every((word) => searchText(group, topic).includes(word))) })).filter((group) => group.topics.length)
}

export const findTopic = (id: string) => GROUPS.flatMap((group) => group.topics.map((topic) => ({ group, topic }))).find((entry) => entry.topic.id === id)
