import { describe, expect, it } from 'vitest'
import { buildPrompt, presetBrief, PROMPT_PRESETS } from './prompts'

describe('AI prompts', () => {
  it('has a blank template plus 10 examples with unique ids', () => {
    expect(PROMPT_PRESETS[0]!.id).toBe('blank')
    expect(PROMPT_PRESETS).toHaveLength(11)
    expect(new Set(PROMPT_PRESETS.map((preset) => preset.id)).size).toBe(11)
  })

  it('every brief covers the same headings', () => {
    for (const { brief } of PROMPT_PRESETS) {
      for (const heading of ['What the page is for', 'Who will read it', 'Language of the text', 'Sections', 'Look and feel', 'Fonts', 'Details']) {
        expect(brief).toContain(heading)
      }
    }
  })

  it('puts the brief between the intro and the rules', () => {
    const prompt = buildPrompt('  - What the page is for: my shop  ')
    expect(prompt.indexOf('PART 1')).toBeLessThan(prompt.indexOf('my shop'))
    expect(prompt.indexOf('my shop')).toBeLessThan(prompt.indexOf('PART 2'))
    expect(prompt).toContain('@media (max-width: 1024px)')
  })

  it('falls back to the blank brief for an unknown id', () => {
    expect(presetBrief('nope')).toBe(presetBrief('blank'))
  })
})
