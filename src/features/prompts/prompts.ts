import { PROMPT_GROUPS } from './promptGroups'
import type { PromptPreset } from './presets/types'
import { PROMPT_RULES } from './promptRules'

export type { PromptPreset } from './presets/types'
export { PROMPT_GROUPS, type PromptGroup } from './promptGroups'

/** Every preset, in display order. */
export const PROMPT_PRESETS: PromptPreset[] = PROMPT_GROUPS.flatMap((group) => group.presets)

const groupOf = (id: string) => PROMPT_GROUPS.find((group) => group.presets.some((preset) => preset.id === id)) ?? PROMPT_GROUPS[0]!

/** The brief (Part 1) of a preset; unknown ids get the first blank brief. */
export const presetBrief = (id: string): string => (PROMPT_PRESETS.find((preset) => preset.id === id) ?? PROMPT_PRESETS[0]!).brief

/** The whole prompt to paste into ChatGPT, Claude or Gemini: the group's intro, the brief, the rules. */
export function buildPrompt(brief: string, presetId = 'blank'): string {
  return `${groupOf(presetId).intro}\n\n${brief.trim()}\n\n${PROMPT_RULES}`
}
