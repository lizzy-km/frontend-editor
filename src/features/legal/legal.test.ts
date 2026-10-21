// @vitest-environment node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { PLANS } from '@/features/billing/plans'
import { LEGAL_UPDATED } from '@/config/legal.config'
import { LISTING_PRICE, MARKET_FEE_PERCENT, MIN_PAYOUT_USD } from '@/features/marketplace/types'
import { PRIVACY } from './privacy'
import { TERMS } from './terms'
import type { LegalBlock, LegalDoc } from './types'

const flags = vi.hoisted(() => ({ enable_billing: true, enable_marketplace: true }))
vi.mock('@/config/features.config', () => ({ features: flags }))

const { visibleSections } = await import('./LegalDocument')
const { fill } = await import('./text')

const textOf = (block: LegalBlock): string[] => (block.kind === 'p' || block.kind === 'note' ? [block.text] : block.kind === 'list' ? block.items : [...block.head, ...block.rows.flat()])
const allText = (doc: LegalDoc) => doc.sections.flatMap((section) => [section.title, ...section.blocks.flatMap(textOf)]).join('\n')
const DOCS: [string, LegalDoc][] = [['Terms', TERMS], ['Privacy', PRIVACY]]

describe.each(DOCS)('%s text', (_name, doc) => {
  it('is complete: every section has an id, a title and words, and no leftovers', () => {
    const ids = doc.sections.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const section of doc.sections) {
      expect(section.id).toMatch(/^[a-z][a-z-]*$/)
      expect(section.title.length).toBeGreaterThan(3)
      expect(section.blocks.length).toBeGreaterThan(0)
      for (const block of section.blocks) {
        if (block.kind === 'table') for (const row of block.rows) expect(row.length, `${section.id} table row`).toBe(block.head.length)
        if (block.kind === 'list') expect(block.items.length).toBeGreaterThan(0)
      }
    }
    expect(doc.sections.length).toBeGreaterThanOrEqual(12)
    expect(allText(doc)).not.toMatch(/lorem|todo|tbd|xxx/i)
  })

  it('uses only known {tokens} and links only to pages that exist', () => {
    const text = allText(doc)
    for (const token of text.match(/\{[a-z]+\}/g) ?? []) expect(['{operator}', '{email}', '{address}', '{country}']).toContain(token)
    for (const link of text.matchAll(/\]\((\/[^)]*)\)/g)) expect(['/terms', '/privacy']).toContain(link[1])
    expect(text).toContain('{email}')
  })
})

describe('what the texts say matches what the app does', () => {
  /** Every localStorage key the app uses, read from the source. */
  function storageKeys(): string[] {
    const keys = new Set<string>()
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) { if (!['export', 'serialize', 'importReact'].includes(name)) walk(path); continue } // sites people publish keep their own keys
        if (!/\.(ts|tsx)$/.test(name) || /\.test\./.test(name)) continue
        for (const match of readFileSync(path, 'utf8').matchAll(/(?:KEY|STORAGE_KEY|HINT_KEY)\s*=\s*'([^']+)'/g)) keys.add(match[1]!)
      }
    }
    walk('src')
    return [...keys]
  }

  it('the privacy policy lists every key the app keeps in the browser (apart from test-only ones)', () => {
    const text = allText(PRIVACY)
    const keys = storageKeys().filter((key) => !/e2e/.test(key))
    expect(keys.length).toBeGreaterThanOrEqual(5)
    for (const key of keys) expect(text, `browser storage: ${key}`).toContain(key)
  })

  it('names every company that handles data', () => {
    const text = allText(PRIVACY)
    for (const name of ['Firebase', 'Google Analytics', 'Cloudflare', 'Vercel', 'NOWPayments', 'GitHub']) expect(text, name).toContain(name)
  })

  it('states the real limits, prices and fee', () => {
    const terms = allText(TERMS)
    expect(terms).toContain(`${PLANS.free.maxProjects} pages`)
    expect(terms).toContain(`${PLANS.pro.maxProjects} saved pages`)
    expect(terms).toContain(`US$${PLANS.pro.priceUsd} per month`)
    expect(terms).toContain(`${MARKET_FEE_PERCENT}%`)
    expect(terms).toContain(`US$${MIN_PAYOUT_USD}`)
    expect(terms).toContain(`US$${LISTING_PRICE.max}`)
  })

  it('the date of the texts is a real date that is not in the future', () => {
    expect(LEGAL_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Date.parse(LEGAL_UPDATED)).toBeLessThanOrEqual(Date.now())
  })
})

describe('sections that depend on features', () => {
  it('show paid plans and the marketplace only while they are switched on', () => {
    const titles = () => visibleSections(TERMS).map((section) => section.id)
    Object.assign(flags, { enable_billing: true, enable_marketplace: true })
    expect(titles()).toEqual(expect.arrayContaining(['plans', 'marketplace']))
    Object.assign(flags, { enable_billing: false, enable_marketplace: true })
    expect(titles()).not.toContain('plans')
    expect(titles()).toContain('marketplace')
    Object.assign(flags, { enable_billing: false, enable_marketplace: false })
    expect(titles()).not.toContain('marketplace')
    expect(titles()).toContain('content')
  })
})

describe('placeholders', () => {
  it('shows a visible placeholder for an operator detail that is not set, and the value once it is', () => {
    expect(fill('Write to {email}')).toMatch(/^Write to \[contact email not set\]$|^Write to \S+@\S+$/)
    expect(fill('{operator} in {country}, {address}')).not.toContain('{')
  })
})
