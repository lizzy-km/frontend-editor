import { describe, expect, it } from 'vitest'
import { addPage } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { listPages } from '@/features/editor/model/pages'
import { buildReactProject } from './buildReactProject'
import { buildSiteProject } from './buildSiteProject'
import { fingerprint, readSnapshot, SNAPSHOT_PATH, withSnapshot } from './snapshot'

const page = () => parseHtmlDocument('<body><section class="hero"><h1>Fresh bread</h1><p>Every day</p></section></body>')
const site = () => addPage(parseHtmlDocument('<body><header><a href="/">Home</a></header><section><h1>Hi</h1></section><footer>Bye</footer></body>'), { title: 'About', path: '/about', from: 'blank' }).doc

describe('reopening a React download', () => {
  it('brings a one-page project back exactly', () => {
    const doc = page()
    const files = withSnapshot(buildReactProject(doc), doc)
    expect(files[SNAPSHOT_PATH]).toBeTruthy()
    const result = readSnapshot(files)
    expect(result.ok && result.doc).toEqual(JSON.parse(JSON.stringify(doc)))
    expect(result.ok && result.changed).toEqual([])
  })

  it('brings a website back with its pages', () => {
    const doc = site()
    const result = readSnapshot(withSnapshot(buildSiteProject(doc, { router: 'react-router' }), doc))
    expect(result.ok && listPages(result.doc).map((p) => p.path)).toEqual(['/', '/about'])
  })

  it('lists files changed or removed outside Tweak, and ignores line endings', () => {
    const doc = page()
    const files = withSnapshot(buildReactProject(doc), doc)
    const edited: Record<string, string> = { ...files, 'src/App.tsx': `${files['src/App.tsx']}\n// mine`, 'src/styles/page.css': files['src/styles/page.css']!.replace(/\n/g, '\r\n') }
    delete edited['README.md']
    const result = readSnapshot(edited)
    expect(result.ok && result.changed.sort()).toEqual(['README.md', 'src/App.tsx'])
  })

  it('says why a folder from somewhere else cannot be opened', () => {
    const none = readSnapshot({ 'package.json': '{}' })
    expect(!none.ok && none.problem).toContain('wasn’t downloaded from Tweak')
    expect(readSnapshot({ [SNAPSHOT_PATH]: 'nope' }).ok).toBe(false)
    expect(readSnapshot({ [SNAPSHOT_PATH]: JSON.stringify({ format: 'other' }) }).ok).toBe(false)
    expect(readSnapshot({ [SNAPSHOT_PATH]: JSON.stringify({ format: 'tweak-project', version: 99, doc: page(), files: {} }) }).ok).toBe(false)
  })

  it('fingerprints text the same on every system', () => {
    expect(fingerprint('a\r\nb')).toBe(fingerprint('a\nb'))
    expect(fingerprint('a')).not.toBe(fingerprint('b'))
  })
})
