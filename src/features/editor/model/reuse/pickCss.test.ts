import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '../parse/parseDocument'
import { collectSubtreeIdsOf, pickCss, splitRules, usageOf } from './pickCss'

describe('picking the CSS a component needs', () => {
  const doc = parseHtmlDocument('<body><article class="card big" id="first"><h3 class="title">T</h3><p>x</p></article><aside class="other">o</aside></body>')
  const article = Object.values(doc.nodes).find((node) => node.kind === 'element' && node.tag === 'article')!
  const usage = usageOf(doc.nodes, collectSubtreeIdsOf(doc.nodes, article.id))

  it('reads the classes, ids and tags a component uses', () => {
    expect([...usage.classes].sort()).toEqual(['big', 'card', 'title'])
    expect([...usage.ids]).toEqual(['first'])
    expect([...usage.tags].sort()).toEqual(['article', 'h3', 'p'])
  })

  it('splits rules, including blocks inside @media', () => {
    const rules = splitRules('a { color: red } @media (max-width: 600px) { .x { color: blue } } @import url(x.css); /* note */ b { top: 0 }')
    expect(rules.map((rule) => rule.head)).toEqual(['a', '@media (max-width: 600px)', '@import url(x.css)', 'b'])
    expect(rules[1]!.body).toContain('.x { color: blue }')
    expect(rules[2]!.body).toBeNull()
  })

  it('keeps rules for its classes, ids and tags, variables, resets, fonts and animations, and drops the rest', () => {
    const css = [
      ':root { --brand: red }', '* { box-sizing: border-box }', '.card { padding: 8px }', '.card:hover .title { color: red }', '.card.big, .nobody { font-size: 20px }',
      '#first { margin: 0 }', 'h3 { margin: 0 }', '.other { color: green }', 'aside p { color: blue }', 'nav a { color: pink }',
      '@font-face { font-family: X; src: url(x.woff) }', '@keyframes pop { from { opacity: 0 } to { opacity: 1 } }',
      '@media (max-width: 600px) { .card { padding: 4px } .other { color: red } }', '@media print { .other { display: none } }',
    ].join('\n')
    const picked = pickCss(css, usage)
    for (const wanted of [':root', '* {', '.card { padding: 8px }', '.card:hover .title', '.card.big, .nobody', '#first', 'h3 { margin: 0 }', '@font-face', '@keyframes pop', '@media (max-width: 600px)', '.card { padding: 4px }']) expect(picked, wanted).toContain(wanted)
    expect(picked).not.toContain('.other { color: green }')
    expect(picked).not.toContain('nav a')
    expect(picked).not.toContain('@media print')
    expect(picked).not.toContain('.other { color: red }')
  })

  it('gives nothing back for CSS with nothing for this component', () => {
    expect(pickCss('.zzz { color: red }', usage)).toBe('')
    expect(pickCss('', usage)).toBe('')
  })
})
