import { PROMPT_GROUPS } from './promptGroups'
import type { PromptPreset } from './presets/types'
import { PROMPT_RULES } from './promptRules'
import { REACT_PROMPT_GROUPS, REACT_PROMPT_PRESETS } from './reactGroups'
import { REACT_RULES } from './reactRules'
import { SITE_RULES } from './siteRules'

/** What is being made: one page, a website with several pages (both one html file that opens in the editor), or a React + TypeScript project. */
export type PromptKind = 'page' | 'site' | 'react'

export type { PromptPreset } from './presets/types'
export { PROMPT_GROUPS, type PromptGroup } from './promptGroups'
export { REACT_PROMPT_GROUPS, REACT_PROMPT_PRESETS }

/** Every preset, in display order. */
export const PROMPT_PRESETS: PromptPreset[] = PROMPT_GROUPS.flatMap((group) => group.presets)

const groupOf = (id: string) => [...PROMPT_GROUPS, ...REACT_PROMPT_GROUPS].find((group) => group.presets.some((preset) => preset.id === id)) ?? PROMPT_GROUPS[0]!

/** Is this idea one of the React project ideas (a whole app with its own pages and features lines)? */
export const isReactIdea = (id: string): boolean => REACT_PROMPT_PRESETS.some((preset) => preset.id === id)

/** The brief (Part 1) of a preset; unknown ids get the first blank brief. */
export const presetBrief = (id: string): string => ([...PROMPT_PRESETS, ...REACT_PROMPT_PRESETS].find((preset) => preset.id === id) ?? PROMPT_PRESETS[0]!).brief

/** For a website, the brief also asks which pages it has (the AI needs them to build the menu). */
export const PAGES_LINE = '- Pages, in menu order: [e.g. Home, About us, Menu, Contact]'
export const FEATURES_LINE = '- Features it needs: [e.g. sign-in, a product list with search and filters, a contact form, an account page]'
export const briefFor = (id: string, kind: PromptKind): string => (kind === 'page' || isReactIdea(id) ? presetBrief(id) : `${presetBrief(id)}
${PAGES_LINE}${kind === 'react' ? `
${FEATURES_LINE}` : ''}`)

/** The group's intro, reworded for a React project (it says "only HTML, CSS and plain JavaScript" and "one-page"). */
const reactLead = (intro: string): string => intro
  .replace('using only HTML, CSS and plain JavaScript', 'as a multi-page React + TypeScript web app: a project of many files, not one html page')
  .replace('one-page website', 'website')
  .replace('PART 1 — THE PAGE', 'PART 1 — THE SITE')

/** The whole prompt to paste into ChatGPT, Claude or Gemini: the group's intro, the brief, the rules (and the several-pages rules for a website). */
export function buildPrompt(brief: string, presetId = 'blank', kind: PromptKind = 'page'): string {
  const intro = groupOf(presetId).intro
  if (kind === 'react') return `${reactLead(intro)}

${brief.trim()}

${REACT_RULES}`
  const lead = kind === 'site' ? intro.replace('one-page website', 'website with several pages') : intro
  return `${lead}

${brief.trim()}

${PROMPT_RULES}${kind === 'site' ? `

${SITE_RULES}` : ''}`
}

/** The rules part (Part 2, and Part 3 for a website) that a kind of prompt ends with. */
export const rulesFor = (kind: PromptKind): string => (kind === 'react' ? REACT_RULES : kind === 'site' ? `${PROMPT_RULES}

${SITE_RULES}` : PROMPT_RULES)

/** The brief after the person switches what is being made: the lines that only one kind needs are added or taken away, everything typed stays. */
export function switchBriefKind(brief: string, to: PromptKind): string {
  const bare = brief.replace(`
${FEATURES_LINE}`, '').replace(`
${PAGES_LINE}`, '')
  return to === 'page' ? bare : `${bare}
${PAGES_LINE}${to === 'react' ? `
${FEATURES_LINE}` : ''}`
}
