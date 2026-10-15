import { describe, expect, it } from 'vitest'
import { CONTACT_FORM_HTML } from '@/features/editor/model/formBlocks'
import { addPage } from '@/features/editor/model/pageOps'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { isElement, type ElementNode } from '@/features/editor/model/types'
import { componentViews, focusedView } from './componentViews'

const page = () => parseHtmlDocument(`<body><header class="top"><a href="/">Home</a></header>
<section class="hero"><h1>Fresh bread</h1><p>Baked daily</p></section>
<section class="cards"><div class="card"><h3>A</h3><p>One</p></div><div class="card"><h3>B</h3><p>Two</p></div><div class="card"><h3>C</h3><p>Three</p></div></section>
${CONTACT_FORM_HTML}<footer>Bye</footer></body>`)

const find = (doc: ReturnType<typeof page>, test: (node: ElementNode) => boolean) =>
  Object.values(doc.nodes).filter(isElement).find(test)!

describe('component views', () => {
  it('lists every component with its code and file path', () => {
    const views = componentViews(page())
    expect(views.length).toBeGreaterThanOrEqual(5)
    for (const view of views) {
      expect(view.path).toMatch(/^src\/components\/.+\.tsx$/)
      expect(view.code).toContain('export default function')
    }
  })

  it('finds the component of the selected element', () => {
    const doc = page()
    const views = componentViews(doc)
    const heading = find(doc, (node) => node.tag === 'h1')
    expect(focusedView(views, doc.nodes, heading.id)!.code).toContain('Fresh bread')
    // inside a repeated card: the card component, not the whole section
    const second = find(doc, (node) => node.tag === 'h3' && node.children.some((id) => (doc.nodes[id] as { text?: string }).text === 'B'))
    expect(focusedView(views, doc.nodes, second.id)!.code).toMatch(/export type \w+Props/)
    // an input inside the form: the form component with its Zod schema
    const input = find(doc, (node) => node.tag === 'input' && node.attrs.name === 'email')
    expect(focusedView(views, doc.nodes, input.id)!.code).toContain('zodResolver')
    expect(focusedView(views, doc.nodes, null)).toBeNull()
  })

  it('in a website, the page file is found for a page container and parts for what is inside', () => {
    const site = addPage(page(), { title: 'About', path: '/about', from: 'code', code: '<section class="team"><h2>Our team</h2></section>' }).doc
    const views = componentViews(site)
    const team = find(site, (node) => node.tag === 'h2' && node.children.some((id) => (site.nodes[id] as { text?: string }).text === 'Our team'))
    expect(focusedView(views, site.nodes, team.id)!.path).toMatch(/components\/about\//)
    const aboutPage = find(site, (node) => node.attrs['data-fe-path'] === '/about')
    expect(focusedView(views, site.nodes, aboutPage.id)!.path).toBe('src/pages/AboutPage.tsx')
  })
})
