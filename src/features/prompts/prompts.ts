import { PROMPT_GROUPS } from './promptGroups'
import type { PromptPreset } from './presets/types'
import { PROMPT_RULES } from './promptRules'
import { SITE_RULES } from './siteRules'

/** What is being made: one page, or a website with several pages. */
export type PromptKind = 'page' | 'site'

export type { PromptPreset } from './presets/types'
export { PROMPT_GROUPS, type PromptGroup } from './promptGroups'

/** Every preset, in display order. */
export const PROMPT_PRESETS: PromptPreset[] = PROMPT_GROUPS.flatMap((group) => group.presets)

const groupOf = (id: string) => PROMPT_GROUPS.find((group) => group.presets.some((preset) => preset.id === id)) ?? PROMPT_GROUPS[0]!

/** The brief (Part 1) of a preset; unknown ids get the first blank brief. */
export const presetBrief = (id: string): string => (PROMPT_PRESETS.find((preset) => preset.id === id) ?? PROMPT_PRESETS[0]!).brief

/** For a website, the brief also asks which pages it has (the AI needs them to build the menu). */
export const PAGES_LINE = '- Pages, in menu order: [e.g. Home, About us, Menu, Contact]'
export const briefFor = (id: string, kind: PromptKind): string => (kind === 'site' ? `${presetBrief(id)}
${PAGES_LINE}` : presetBrief(id))

/** The whole prompt to paste into ChatGPT, Claude or Gemini: the group's intro, the brief, the rules (and the several-pages rules for a website). */
export function buildPrompt(brief: string, presetId = 'blank', kind: PromptKind = 'page'): string {
  const intro = groupOf(presetId).intro
  const lead = kind === 'site' ? intro.replace('one-page website', 'website with several pages') : intro
  return `${lead}

${brief.trim()}

${PROMPT_RULES}${kind === 'site' ? `

${SITE_RULES}` : ''}`
}
