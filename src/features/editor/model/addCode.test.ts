import { describe, expect, it } from 'vitest'
import { addCodeToDoc } from './addCode'
import { parseHtmlDocument } from './parse/parseDocument'
import { isElement } from './types'

const base = () => parseHtmlDocument('<body><section class="a"><h1>Hi</h1></section></body>')
const at = (doc: ReturnType<typeof base>) => ({ parentId: doc.rootId })
const tags = (doc: ReturnType<typeof base>) => Object.values(doc.nodes).filter(isElement).map((node) => node.tag)

describe('add code to the page', () => {
  it('adds HTML where it is told, with its own style and script tags merged into the page', () => {
    const doc = base()
    const result = addCodeToDoc(doc, { html: '<div class="box"><p>New</p></div><style>.box{color:red}</style><script>window.x = 1</script>' }, at(doc))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(tags(result.doc)).toContain('p')
    expect(result.doc.css).toContain('.box{color:red}')
    expect(result.doc.scripts.some((script) => script.code?.includes('window.x'))).toBe(true)
    expect(result.firstId).toBeTruthy()
    expect(result.found.join(' ')).toMatch(/styles/)
  })

  it('takes separate CSS and JavaScript boxes', () => {
    const doc = base()
    const result = addCodeToDoc(doc, { html: '<aside>Side</aside>', css: 'aside{padding:8px}', js: 'console.log(1)' }, at(doc))
    expect(result.ok && result.doc.css).toContain('aside{padding:8px}')
    expect(result.ok && result.doc.scripts).toHaveLength(1)
  })

  it('CSS or JavaScript alone is enough, and adds no elements', () => {
    const doc = base()
    const onlyCss = addCodeToDoc(doc, { html: '', css: '.a{margin:0}' }, at(doc))
    expect(onlyCss.ok && Object.keys(onlyCss.doc.nodes).length).toBe(Object.keys(doc.nodes).length)
    expect(onlyCss.ok && onlyCss.doc.css).toContain('.a{margin:0}')
    const onlyJs = addCodeToDoc(doc, { html: '', js: 'alert(1)' }, at(doc))
    expect(onlyJs.ok && onlyJs.doc.scripts).toHaveLength(1)
  })

  it('does not add the same style or script twice', () => {
    const doc = base()
    const once = addCodeToDoc(doc, { html: '', css: '.a{margin:0}', js: 'go()' }, at(doc))
    if (!once.ok) throw new Error('first add')
    const twice = addCodeToDoc(once.doc, { html: '', css: '.a{margin:0}', js: 'go()' }, at(once.doc))
    expect(twice.ok && twice.doc.css.match(/\.a\{margin:0\}/g)).toHaveLength(1)
    expect(twice.ok && twice.doc.scripts).toHaveLength(1)
  })

  it('says what is wrong when nothing or something that is not HTML is pasted', () => {
    const doc = base()
    expect(addCodeToDoc(doc, { html: '  ' }, at(doc))).toMatchObject({ ok: false })
    const result = addCodeToDoc(doc, { html: 'just some words' }, at(doc))
    expect(!result.ok && result.problem).toContain('HTML')
  })

  it('keeps stylesheet links (fonts) and puts the new pieces at the chosen place', () => {
    const doc = base()
    const result = addCodeToDoc(doc, { html: '<link rel="stylesheet" href="https://fonts.example/x.css"><p>Second</p>' }, { parentId: doc.rootId, index: 0 })
    expect(result.ok && result.doc.links).toContain('https://fonts.example/x.css')
    if (!result.ok) return
    const body = result.doc.nodes[result.doc.rootId] as { children: string[] }
    expect(tags({ ...result.doc, nodes: { [body.children[0]!]: result.doc.nodes[body.children[0]!]! } } as never)[0]).toBe('p')
  })
})
