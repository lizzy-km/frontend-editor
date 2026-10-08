import { describe, expect, it } from 'vitest'
import { buildPrompt, presetBrief, PROMPT_GROUPS, PROMPT_PRESETS } from './prompts'

describe('AI prompts', () => {
  it('has two groups, each starting blank, with unique ids', () => {
    expect(PROMPT_GROUPS.map((group) => group.id)).toEqual(['everyday', 'portfolio'])
    for (const group of PROMPT_GROUPS) expect(group.presets[0]!.label).toBe('Start blank')
    expect(PROMPT_GROUPS[0]!.presets.length).toBeGreaterThanOrEqual(9)
    expect(PROMPT_GROUPS[1]!.presets.length).toBeGreaterThanOrEqual(12)
    expect(new Set(PROMPT_PRESETS.map((preset) => preset.id)).size).toBe(PROMPT_PRESETS.length)
  })

  it('every brief covers the same headings', () => {
    for (const { id, brief } of PROMPT_PRESETS) {
      for (const heading of ['What the page is for', 'Who will read it', 'Language of the text', 'Sections', 'Look and feel', 'Fonts', 'Details']) {
        expect(brief, `${id}: ${heading}`).toContain(heading)
      }
      expect(brief, id).not.toMatch(/\$\{|\{\{/) // no leftover template placeholders
    }
  })

  it('uses the intro of the chosen group, then the brief, then the rules', () => {
    const portfolio = buildPrompt('- What the page is for: my work', 'portfolioDeveloper')
    expect(portfolio).toContain('portfolio website')
    expect(portfolio.indexOf('PART 1')).toBeLessThan(portfolio.indexOf('my work'))
    expect(portfolio.indexOf('my work')).toBeLessThan(portfolio.indexOf('PART 2'))
    expect(buildPrompt('x', 'cafe')).toContain('one-page website')
    expect(buildPrompt('x', 'cafe')).toContain('MAKE IT EYE-CATCHING')
  })

  it('falls back to the everyday blank brief for an unknown id', () => {
    expect(presetBrief('nope')).toBe(presetBrief('blank'))
  })
})
