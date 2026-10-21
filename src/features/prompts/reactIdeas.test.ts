import { describe, expect, it } from 'vitest'
import { APP_BRIEF_HEADINGS } from './presets/appBrief'
import { briefFor, buildPrompt, PAGES_LINE, PROMPT_PRESETS, REACT_PROMPT_GROUPS, REACT_PROMPT_PRESETS } from './prompts'

describe('the ideas for React projects', () => {
  const real = REACT_PROMPT_PRESETS.filter((preset) => preset.label !== 'Start blank')
  const numbered = (brief: string, heading: string) => {
    const after = brief.slice(brief.indexOf(`- ${heading}`))
    const next = after.slice(2).search(/\n- [A-Z]/)
    return after.slice(0, next < 0 ? undefined : next + 2).split('\n').slice(1)
  }

  it('are four groups that each start blank, with unique ids across every idea', () => {
    expect(REACT_PROMPT_GROUPS.map((group) => group.label)).toEqual(['Shops & marketplaces', 'Booking & services', 'Learning & community', 'Dashboards & tools'])
    for (const group of REACT_PROMPT_GROUPS) {
      expect(group.presets[0]!.label).toBe('Start blank')
      expect(group.presets.length, group.id).toBeGreaterThanOrEqual(6)
      expect(group.intro).toContain('React + TypeScript web app')
    }
    const ids = [...PROMPT_PRESETS, ...REACT_PROMPT_PRESETS].map((preset) => preset.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(real.length).toBeGreaterThanOrEqual(20)
  })

  it('every idea has the same headings and no leftover placeholders', () => {
    for (const { id, brief } of REACT_PROMPT_PRESETS) {
      for (const heading of APP_BRIEF_HEADINGS) expect(brief, `${id}: ${heading}`).toContain(heading)
      expect(brief, id).not.toMatch(/\$\{|\{\{|undefined/)
    }
  })

  it('every real idea is a whole app: many pages, sign-in, a protected area, several features, realistic data, demo accounts', () => {
    for (const { id, brief } of real) {
      const pages = numbered(brief, 'Pages, in menu order')
      expect(pages.length, `${id}: pages`).toBeGreaterThanOrEqual(8)
      expect(pages.join(' '), `${id}: sign-in pages`).toMatch(/Log in/)
      expect(pages.join(' '), `${id}: a protected area`).toMatch(/only/)
      expect(numbered(brief, 'Features it needs').length, `${id}: features`).toBeGreaterThanOrEqual(4)
      expect(numbered(brief, 'Data it works with').length, `${id}: data`).toBeGreaterThanOrEqual(3)
      expect(brief, `${id}: demo accounts`).toMatch(/demo accounts?/i)
      expect(brief, `${id}: roles`).toMatch(/Who will use it: .*\(.*\)/)
    }
  })

  it('are used as they are: no pages or features line is added, and the prompt is the React one', () => {
    const idea = REACT_PROMPT_PRESETS[1]!
    expect(briefFor(idea.id, 'react')).toBe(idea.brief)
    const prompt = buildPrompt(briefFor(idea.id, 'react'), idea.id, 'react')
    expect(prompt).toContain(idea.brief)
    expect(prompt).toContain('PART 2 — OUTPUT RULES FOR A REACT + TYPESCRIPT PROJECT')
    expect(prompt).toContain('working sign-in, protected pages and realistic mock data')
    expect(prompt.match(/Features it needs/g)).toHaveLength(1)
    expect(prompt).not.toContain(PAGES_LINE)
    expect(prompt).not.toContain('only HTML, CSS and plain JavaScript')
  })
})
