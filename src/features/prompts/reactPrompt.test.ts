import { describe, expect, it } from 'vitest'
import { DATA_DEPS } from '@/features/export/react/dataTemplates'
import { FORM_DEPS } from '@/features/export/react/forms/formKit'
import { packageJson } from '@/features/export/react/projectTemplates'
import { ROUTERS } from '@/features/export/react/routerTemplates'
import { briefFor, buildPrompt, FEATURES_LINE, PAGES_LINE, presetBrief, rulesFor, switchBriefKind } from './prompts'
import { REACT_PACKAGE_JSON } from './reactRulesStack'

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
