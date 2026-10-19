import { describe, expect, it } from 'vitest'
import { CHOICES_ATTR } from '@/features/editor/model/widgets/filterData'
import { listPages } from '@/features/editor/model/pages'
import { forVisitors } from '@/features/editor/model/serialize/forVisitors'
import { isElement, type ElementNode, type PageDoc } from '@/features/editor/model/types'
import { buildSiteProject } from '@/features/export/react/buildSiteProject'
import { SHOWCASES } from './catalog'

const elements = (doc: PageDoc) => Object.values(doc.nodes).filter((node): node is ElementNode => isElement(node))
const values = (doc: PageDoc, attr: string) => elements(doc).flatMap((node) => (node.attrs[attr] !== undefined ? [node.attrs[attr]!] : []))
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

describe.each(SHOWCASES)('showcase: $title', (showcase) => {
  const doc = showcase.build()
  const pages = listPages(doc)
  const sources = new Set((doc.data ?? []).map((source) => source.name))

  it('is described for people and claims only what it uses', () => {
    expect(showcase.tagline.length).toBeGreaterThan(20)
    expect(showcase.features.length).toBeGreaterThanOrEqual(4)
    expect(showcase.requires.length).toBeGreaterThanOrEqual(4)
    for (const attr of showcase.requires) expect(values(doc, attr).length, `uses ${attr}`).toBeGreaterThan(0)
  })

  it('is a site with at least four pages that all have content, a title and a menu entry', () => {
    expect(pages.length).toBeGreaterThanOrEqual(4)
    expect(new Set(pages.map((page) => page.path)).size).toBe(pages.length)
    for (const page of pages) {
      expect((doc.nodes[page.id] as ElementNode).children.length, page.path).toBeGreaterThan(0)
      expect(page.title.trim().length).toBeGreaterThan(0)
    }
    expect(pages.filter((page) => page.inMenu).length).toBeGreaterThanOrEqual(3)
  })

  it('connects everything it shows: data, filters, pop-ups and links all point at something that exists', () => {
    for (const name of [...values(doc, 'data-fe-list'), ...values(doc, 'data-fe-record')]) expect(sources.has(name), `data source ${name}`).toBe(true)
    const filterable = new Set(values(doc, 'data-ui-filterable'))
    for (const name of values(doc, 'data-ui-for')) expect(filterable.has(name), `search or filter for ${name}`).toBe(true)
    for (const choice of values(doc, CHOICES_ATTR)) expect(sources.has(choice.split('.')[0]!), `filter choices from ${choice}`).toBe(true)
    const popups = new Set(values(doc, 'data-fe-modal'))
    for (const name of values(doc, 'data-fe-open')) expect(popups.has(name), `pop-up ${name}`).toBe(true)
    const known = new Set([...pages.map((page) => page.path), ...AUTH_PATHS])
    for (const href of values(doc, 'href').filter((value) => value.startsWith('/'))) expect(known.has(href.split(/[?#]/)[0]!), `link ${href}`).toBe(true)
    for (const go of values(doc, 'data-fe-go')) expect(known.has(go.split(/[?#]/)[0]!) || go.includes(':'), `goes to ${go}`).toBe(true)
  })

  it('uses real pictures with descriptions, and nothing from the computer', () => {
    for (const node of elements(doc).filter((item) => item.tag === 'img')) {
      expect(node.attrs.src ?? node.attrs['data-fe-bind-src'], 'picture source').toBeTruthy()
      if (node.attrs.src) expect(node.attrs.src.startsWith('https://'), node.attrs.src).toBe(true)
      expect(node.attrs.alt !== undefined, 'alt text').toBe(true)
    }
    for (const source of doc.data ?? []) for (const row of source.rows) for (const value of Object.values(row)) if (typeof value === 'string' && /\.(png|jpe?g|webp)$/i.test(value)) expect(value.startsWith('https://'), value).toBe(true)
  })

  it('shows up for visitors (Preview and downloads) without leftovers', () => {
    const visitors = forVisitors(doc)
    const text = elements(visitors).map((node) => JSON.stringify(node.attrs)).join(' ')
    expect(text).not.toContain('undefined')
    expect(visitors.scripts.length).toBeGreaterThan(0) // the players for lists, pop-ups, widgets…
  })

  it('exports as a React project for both routers, one file per page', () => {
    for (const router of ['react-router', 'tanstack'] as const) {
      const files = buildSiteProject(doc, { router })
      expect(Object.keys(files).filter((path) => path.startsWith('src/pages/')).length, router).toBeGreaterThanOrEqual(pages.length)
      expect(files['src/main.tsx']).toBeTruthy()
    }
  })
})
