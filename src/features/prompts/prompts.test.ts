import { describe, expect, it } from 'vitest'
import { buildPrompt, presetBrief, PROMPT_GROUPS, PROMPT_PRESETS } from './prompts'

describe('AI prompts', () => {
  it('has four groups, each starting blank, with unique ids', () => {
    expect(PROMPT_GROUPS.map((group) => group.id)).toEqual(['everyday', 'brands', 'events', 'portfolio'])
    for (const group of PROMPT_GROUPS) {
      expect(group.presets[0]!.label).toBe('Start blank')
      expect(group.presets.length, group.id).toBeGreaterThanOrEqual(6)
      expect(group.presets.every(Boolean), group.id).toBe(true)
    }
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
    expect(buildPrompt('x', 'birthday')).toContain('event website')
    expect(buildPrompt('x', 'fashionDrop')).toContain('brand or product launch website')
  })

  it('falls back to the everyday blank brief for an unknown id', () => {
    expect(presetBrief('nope')).toBe(presetBrief('blank'))
  })
})
