import { BUSINESS_PRESETS } from './presets/business'
import { COMMUNITY_PRESETS } from './presets/community'
import { PERSONAL_PRESETS } from './presets/personal'
import type { PromptPreset } from './presets/types'
import { PROMPT_RULES } from './promptRules'

export type { PromptPreset } from './presets/types'

const BLANK: PromptPreset = {
  id: 'blank',
  label: 'Start blank',
  icon: '✏️',
  brief: `- What the page is for: [e.g. the website of my bakery; goal: get people to visit and order cakes]
- Who will read it: [e.g. families and office workers nearby]
- Language of the text: [e.g. English]
- Sections, in this order: [e.g. header, hero with a big photo, 3 highlights, menu with prices, about us, reviews, opening hours and map link, footer]
- Look and feel: [e.g. warm and friendly, cream and chocolate brown, rounded corners, lots of photos]
- Fonts: [e.g. Playfair Display for headings, Inter for text]
- Details: [e.g. address, phone, opening hours, prices, dates, links]`,
}

/** "Start blank" first, then the ready-made examples (10). */
export const PROMPT_PRESETS: PromptPreset[] = [BLANK, ...BUSINESS_PRESETS, ...PERSONAL_PRESETS, ...COMMUNITY_PRESETS]

const INTRO = `You are a senior web designer and front-end developer. Build a complete, beautiful, modern one-page website for what is described in Part 1, using only HTML, CSS and plain JavaScript. It should feel made for this business or person — specific, warm and polished, never a generic template — and give visitors one clear thing to do next.

PART 1 — THE PAGE (change this freely)`

/** The text between the intro and the rules, for one preset (or a brief the person edited). */
export const presetBrief = (id: string): string => (PROMPT_PRESETS.find((preset) => preset.id === id) ?? BLANK).brief

/** The whole prompt to paste into ChatGPT, Claude or Gemini. */
export function buildPrompt(brief: string): string {
  return `${INTRO}\n\n${brief.trim()}\n\n${PROMPT_RULES}`
}
