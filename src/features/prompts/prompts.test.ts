import { describe, expect, it } from 'vitest'
import { asKind } from '@/features/import/projectKind'
import { listPages } from '@/features/editor/model/pages'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { DATA_DEPS } from '@/features/export/react/dataTemplates'
import { FORM_DEPS } from '@/features/export/react/forms/formKit'
import { packageJson } from '@/features/export/react/projectTemplates'
import { ROUTERS } from '@/features/export/react/routerTemplates'
import { briefFor, buildPrompt, FEATURES_LINE, PAGES_LINE, presetBrief, PROMPT_GROUPS, PROMPT_PRESETS, rulesFor, switchBriefKind } from './prompts'
import { REACT_PACKAGE_JSON } from './reactRulesStack'

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

  it('adds the several-pages rules and a pages line only for a website', () => {
    const site = buildPrompt(briefFor('cafe', 'site'), 'cafe', 'site')
    expect(site).toContain('website with several pages')
    expect(site).not.toContain('one-page website')
    expect(site).toContain('PART 3 — SEVERAL PAGES')
    expect(site).toContain('data-fe-page="about" data-fe-path="/about"')
    expect(site).toContain('Pages, in menu order')
    expect(site.indexOf('PART 2')).toBeLessThan(site.indexOf('PART 3'))
    const page = buildPrompt(briefFor('cafe', 'page'), 'cafe')
    expect(page).not.toContain('PART 3')
    expect(page).not.toContain('Pages, in menu order')
  })

  it('falls back to the everyday blank brief for an unknown id', () => {
    expect(presetBrief('nope')).toBe(presetBrief('blank'))
  })

  it('an answer written to the several-pages rules opens as a site with its own header and footer', () => {
    const answer = `<!doctype html><html lang="en"><head><title>Cafe</title><style>.a{color:red}</style></head><body>
      <header><a href="/">Cafe</a><nav><a href="/menu">Menu</a></nav></header>
      <div data-fe-page="home" data-fe-path="/" data-fe-title="Home"><section id="hero"><h1>Hi</h1></section></div>
      <div data-fe-page="menu" data-fe-path="/menu" data-fe-title="Menu"><section id="list"><h1>Menu</h1></section></div>
      <footer>© Cafe</footer></body></html>`
    const doc = asKind(parseHtmlDocument(answer), 'site')
    expect(listPages(doc).map((page) => [page.key, page.path, page.title])).toEqual([['home', '/', 'Home'], ['menu', '/menu', 'Menu']])
  })

  describe('the React project prompt', () => {
    const react = buildPrompt(briefFor('cafe', 'react'), 'cafe', 'react')

    it('asks for a multi-page React + TypeScript project, not one html page', () => {
      expect(react).toContain('multi-page React + TypeScript web app')
      expect(react).not.toContain('only HTML, CSS and plain JavaScript')
      expect(react).not.toContain('one-page website')
      expect(react).toContain('PART 1 — THE SITE')
      expect(react).toContain('PART 2 — OUTPUT RULES FOR A REACT + TYPESCRIPT PROJECT')
      expect(react).not.toContain('PART 3')
      expect(react.indexOf('PART 1')).toBeLessThan(react.indexOf('PART 2'))
      expect(react).not.toMatch(/\$\{|\{\{/)
    })

    it('covers what was asked for: pages, sign-in, mock data, responsive, packages, feature folders, clean code', () => {
      for (const topic of [
        'FILE TREE', 'FILE: path', 'CONTINUE FROM', 'src/features/<name>/', 'src/shared/ui/', 'createBrowserRouter', 'lazy',
        'ProtectedRoute', 'admin@example.com / admin123', 'VITE_USE_MOCK', 'react-hook-form', 'zod', '@tanstack/react-query',
        'EmptyState', 'ErrorState', 'Mobile first', 'min-width: 640px', 'prefers-reduced-motion', 'strict', 'no "any"', 'README.md', 'BEFORE YOU ANSWER',
        'npm install && npm run build', 'react-router/dom', 'z.email()',
      ]) expect(react, topic).toContain(topic)
    })

    it('uses the same libraries and versions as the React projects Tweak downloads', () => {
      const ours = JSON.parse(REACT_PACKAGE_JSON) as { dependencies: Record<string, string>; devDependencies: Record<string, string> }
      const theirs = JSON.parse(packageJson('x', { ...ROUTERS['react-router'].deps, ...DATA_DEPS, ...FORM_DEPS })) as typeof ours
      expect(ours.dependencies).toEqual(Object.fromEntries(Object.entries(theirs.dependencies).sort(([a], [b]) => a.localeCompare(b))))
      expect(ours.devDependencies).toEqual(theirs.devDependencies)
      expect(react).toContain(REACT_PACKAGE_JSON)
    })

    it('asks for the pages and the features in the brief, and switching kinds keeps what was typed', () => {
      expect(briefFor('cafe', 'react')).toContain(PAGES_LINE)
      expect(briefFor('cafe', 'react')).toContain(FEATURES_LINE)
      expect(briefFor('cafe', 'site')).toContain(PAGES_LINE)
      expect(briefFor('cafe', 'site')).not.toContain(FEATURES_LINE)
      const typed = `${presetBrief('cafe')} and my own words`
      const forReact = switchBriefKind(typed, 'react')
      expect(forReact).toContain('my own words')
      expect(forReact).toContain(FEATURES_LINE)
      expect(switchBriefKind(forReact, 'site')).toBe(switchBriefKind(typed, 'site'))
      expect(switchBriefKind(forReact, 'page')).toBe(typed)
      expect(switchBriefKind(switchBriefKind(typed, 'react'), 'react')).toBe(forReact)
    })

    it('picks the rules that belong to each kind', () => {
      expect(rulesFor('react')).toContain('REACT + TYPESCRIPT')
      expect(rulesFor('site')).toContain('PART 3 — SEVERAL PAGES')
      expect(rulesFor('page')).not.toContain('PART 3')
    })
  })
})
