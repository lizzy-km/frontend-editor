import { describe, expect, it } from 'vitest'
import { addAuthPages } from '@/features/editor/model/authPages'
import { addPage, updatePage } from '@/features/editor/model/pageOps'
import { listPages } from '@/features/editor/model/pages'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildPageParts } from '@/features/editor/model/serialize/buildPage'
import { pageDoc, pageFileName } from '@/features/editor/model/serialize/sitePages'
import { currentPageDoc, siteToSplitFiles } from './siteFiles'

const SITE = () => addPage(parseHtmlDocument(
  '<html><head><title>Bakery</title><style>.hero{color:red}</style></head><body><nav><a href="/">Home</a> <a href="/about">About</a></nav><section class="hero">Bread</section><footer>Bye</footer></body></html>',
), { title: 'About', path: '/about', from: 'code', code: '<style>.team{color:blue}</style><section class="team">Team</section>' }).doc

describe('site pages', () => {
  it('names page files', () => {
    expect(pageFileName('/')).toBe('index.html')
    expect(pageFileName('/about')).toBe('about.html')
    expect(pageFileName('/shop/new')).toBe('shop-new.html')
  })

  it('turns one page into a normal document: layout + that page, no containers', () => {
    const site = SITE()
    const about = listPages(site)[1]!
    const html = buildPageParts(pageDoc(site, about.id)).bodyHtml
    expect(html).toContain('<nav>')
    expect(html).toContain('Team')
    expect(html).not.toContain('Bread')
    expect(html).not.toContain('data-fe-page')
  })

  it('gives each page its own tab title and file links for downloads', () => {
    const site = SITE()
    const about = listPages(site)[1]!
    const doc = currentPageDoc(site, about.id, true)
    expect(doc.title).toBe('About · Bakery')
    expect(buildPageParts(doc).bodyHtml).toContain('href="about.html"')
    expect(currentPageDoc(site, listPages(site)[0]!.id).title).toBe('Bakery')
  })

  it('downloads a whole site: one html per page sharing one stylesheet', () => {
    const files = siteToSplitFiles(SITE())
    expect(Object.keys(files).sort()).toEqual(['about.html', 'index.html', 'styles.css'])
    expect(files['styles.css']).toContain('.hero{color:red}')
    expect(files['styles.css']).toContain('.team{color:blue}')
    expect(files['index.html']).toContain('Bread')
    expect(files['about.html']).toContain('Team')
    expect(files['about.html']).toContain('href="index.html"')
  })

  it('sends signed-out visitors of a private page to the log in page file', () => {
    const doc = addAuthPages(SITE())
    const account = addPage(doc, { title: 'Account', path: '/account', from: 'blank' })
    const site = updatePage(account.doc, account.pageId, { private: true })
    const files = siteToSplitFiles(site)
    expect(files['account.html']).toContain('location.replace("login.html")')
    expect(files['index.html']).not.toContain('location.replace')
    expect(files['login.html']).not.toContain('location.replace')
  })
})
