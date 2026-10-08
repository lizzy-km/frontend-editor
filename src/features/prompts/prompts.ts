import { BUSINESS_PRESETS } from './presets/business'
import { COMMUNITY_PRESETS } from './presets/community'
import { RESUME_PRESET, WEDDING_PRESET } from './presets/personal'
import { CREATIVE_PORTFOLIO_PRESETS } from './presets/portfolioCreative'
import { PROFESSIONAL_PORTFOLIO_PRESETS } from './presets/portfolioProfessional'
import type { PromptPreset } from './presets/types'
import { PROMPT_RULES } from './promptRules'

export type { PromptPreset } from './presets/types'

/** Kinds of page; each has its own intro and its own blank brief. */
export type PromptGroup = { id: 'everyday' | 'portfolio'; label: string; intro: string; presets: PromptPreset[] }

const PART_1 = 'PART 1 — THE PAGE (change this freely)'

const EVERYDAY_INTRO = `You are an award-winning web designer and senior front-end developer. Build a complete, beautiful, eye-catching one-page website for what is described in Part 1, using only HTML, CSS and plain JavaScript. It must look like a premium, custom-made site that a top design studio would be proud of — bold, memorable and made for this business or event, never a generic template — while staying easy to read and giving visitors one clear thing to do next.

${PART_1}`

const PORTFOLIO_INTRO = `You are an award-winning web designer, senior front-end developer and personal-branding specialist. Build a complete, visually striking portfolio website for the person or studio described in Part 1, using only HTML, CSS and plain JavaScript. It must feel premium, personal and unforgettable — like a site that could be featured on Awwwards — never a generic template. It should show who they are, prove their skill through real-looking work, explain how they work, build trust, and give visitors one clear way to get in touch.

${PART_1}`

const EVERYDAY_BLANK: PromptPreset = {
  id: 'blank',
  label: 'Start blank',
  icon: '✏️',
  brief: `- What the page is for: [e.g. the website of my bakery; goal: get people to visit and order cakes]
- Who will read it: [e.g. families and office workers nearby]
- Language of the text: [e.g. English]
- Sections, in this order: [e.g. header, hero with a big photo, 3 highlights, menu with prices, about us, reviews, opening hours and map link, footer]
- Look and feel: [e.g. warm and cozy, cream and chocolate brown with a raspberry accent, full-width photos, rounded cards that lift on hover]
- Fonts: [e.g. Playfair Display for headings, Inter for text]
- Details: [e.g. address, phone, opening hours, prices, dates, links]`,
}

const PORTFOLIO_BLANK: PromptPreset = {
  id: 'portfolioBlank',
  label: 'Start blank',
  icon: '✏️',
  brief: `- What the page is for: [e.g. Personal portfolio for a freelance brand designer who wants more client enquiries]
- Who will read it: [e.g. startups and small businesses hiring a designer]
- Language of the text: [e.g. English]
- Sections, in this order: [e.g. header/nav, hero with name and role, about, selected work (6 project cards), services, process, tools, testimonials, experience, contact, footer]
- Look and feel: [e.g. light warm-grey background, black text, one orange accent, large editorial headings]
- Fonts: [e.g. Fraunces for headings, Inter for body]
- Details: [e.g. name, city, email, availability, social links, number of projects, years of experience]`,
}

/** Everyday pages first (most people), then portfolios. */
export const PROMPT_GROUPS: PromptGroup[] = [
  { id: 'everyday', label: 'Everyday pages', intro: EVERYDAY_INTRO, presets: [EVERYDAY_BLANK, ...BUSINESS_PRESETS, WEDDING_PRESET, ...COMMUNITY_PRESETS] },
  { id: 'portfolio', label: 'Portfolios', intro: PORTFOLIO_INTRO, presets: [PORTFOLIO_BLANK, ...CREATIVE_PORTFOLIO_PRESETS, ...PROFESSIONAL_PORTFOLIO_PRESETS, RESUME_PRESET] },
]

/** Every preset, in display order. */
export const PROMPT_PRESETS: PromptPreset[] = PROMPT_GROUPS.flatMap((group) => group.presets)

const groupOf = (id: string) => PROMPT_GROUPS.find((group) => group.presets.some((preset) => preset.id === id)) ?? PROMPT_GROUPS[0]!

/** The brief (Part 1) of a preset; unknown ids get the everyday blank. */
export const presetBrief = (id: string): string => PROMPT_PRESETS.find((preset) => preset.id === id)?.brief ?? EVERYDAY_BLANK.brief

/** The whole prompt to paste into ChatGPT, Claude or Gemini: the group's intro, the brief, the rules. */
export function buildPrompt(brief: string, presetId = 'blank'): string {
  return `${groupOf(presetId).intro}\n\n${brief.trim()}\n\n${PROMPT_RULES}`
}
