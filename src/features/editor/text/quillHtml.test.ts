import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import { isTextEditable } from '../model/tree/textRules'
import { quillToInlineHtml } from './quillHtml'

describe('quillToInlineHtml', () => {
  it('unwraps a single paragraph', () => {
    expect(quillToInlineHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello <strong>world</strong>')
  })
  it('turns paragraphs into line breaks and drops empty trailing lines', () => {
    expect(quillToInlineHtml('<p>One</p><p>Two</p><p><br></p>')).toBe('One<br>Two')
  })
  it('replaces non-breaking spaces from Quill', () => {
    expect(quillToInlineHtml('<p>a&nbsp;b</p>')).toBe('a b')
  })
})

describe('isTextEditable', () => {
  const doc = parseHtmlDocument(`<body><h1>Build <span class="blue">faster</span></h1>
    <p><i class="fa fa-star"></i> Rated</p><div><img src="x"></div><button></button></body>`)
  const byTag = (tag: string) => Object.values(doc.nodes).find((node) => node.kind === 'element' && node.tag === tag)!.id

  it('allows text with simple formatting', () => expect(isTextEditable(doc.nodes, byTag('h1'))).toBe(true))
  it('refuses text that contains an icon', () => expect(isTextEditable(doc.nodes, byTag('p'))).toBe(false))
  it('refuses boxes with pictures', () => expect(isTextEditable(doc.nodes, byTag('div'))).toBe(false))
  it('allows empty text tags', () => expect(isTextEditable(doc.nodes, byTag('button'))).toBe(true))
})

describe('isTextEditable keeps Quill away from what it would destroy', () => {
  const doc = parseHtmlDocument(`<body>
    <h1><span class="rank">Master Chief</span> <span>Daniel R.</span> <span>Okafor</span></h1>
    <h2>Go <a class="btn" href="#x">now</a></h2>
    <h3>Visit <a href="#x" target="_blank">us</a></h3>
    <p>Plain <small>fine print</small></p>
    <svg><text>1996 – 2026</text></svg></body>`)
  const byTag = (tag: string) => Object.values(doc.nodes).find((node) => node.kind === 'element' && node.tag === tag)!.id

  it('refuses a heading built from bare spans (lines would merge)', () => expect(isTextEditable(doc.nodes, byTag('h1'))).toBe(false))
  it('still allows editing one of those spans on its own', () => {
    const bare = Object.values(doc.nodes).find((node) => node.kind === 'element' && node.tag === 'span' && !node.attrs.class)!
    expect(isTextEditable(doc.nodes, bare.id)).toBe(true)
  })
  it('refuses a link with a class (the class would be dropped)', () => expect(isTextEditable(doc.nodes, byTag('h2'))).toBe(false))
  it('allows a plain link', () => expect(isTextEditable(doc.nodes, byTag('h3'))).toBe(true))
  it('refuses <small> (Quill has no format for it)', () => expect(isTextEditable(doc.nodes, byTag('p'))).toBe(false))
  it('refuses SVG text', () => expect(isTextEditable(doc.nodes, byTag('text'))).toBe(false))
})
