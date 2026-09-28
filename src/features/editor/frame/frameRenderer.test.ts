import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import { getElement } from '../model/tree/queries'
import { moveNode, patchNode, removeNode } from '../model/tree/treeOps'
import type { ElementNode, TextNode } from '../model/types'
import { createFrameRenderer } from './frameRenderer'

function setup(html: string) {
  const doc = parseHtmlDocument(html)
  const frameDoc = document.implementation.createHTMLDocument('frame')
  const renderer = createFrameRenderer(frameDoc)
  renderer.sync(doc.nodes, doc.rootId)
  const body = getElement(doc.nodes, doc.rootId)!
  return { doc, frameDoc, renderer, body }
}

describe('frame renderer', () => {
  it('renders the tree and strips inline handlers', () => {
    const { frameDoc } = setup('<body class="x"><button onclick="alert(1)">Hi</button><svg><path d="M0"/></svg></body>')
    expect(frameDoc.body.className).toBe('x')
    expect(frameDoc.querySelector('button')!.hasAttribute('onclick')).toBe(false)
    expect(frameDoc.querySelector('path')!.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  it('patches only what changed and keeps element identity', () => {
    const { doc, frameDoc, renderer, body } = setup('<body><h1>Old</h1><p>Keep</p></body>')
    const heading = frameDoc.querySelector('h1')!
    const paragraph = frameDoc.querySelector('p')!
    const textId = getElement(doc.nodes, body.children[0])!.children[0]!

    const nodes = patchNode<TextNode>(doc.nodes, textId, (node) => ({ ...node, text: 'New' }))
    renderer.sync(nodes, doc.rootId)
    expect(heading.textContent).toBe('New')
    expect(frameDoc.querySelector('h1')).toBe(heading)
    expect(frameDoc.querySelector('p')).toBe(paragraph)
  })

  it('handles move, tag change and removal', () => {
    const { doc, frameDoc, renderer, body } = setup('<body><h1>A</h1><p>B</p></body>')
    const [h1Id, pId] = body.children as [string, string]

    let nodes = moveNode(doc.nodes, pId, doc.rootId, 0)
    renderer.sync(nodes, doc.rootId)
    expect(frameDoc.body.firstElementChild!.tagName).toBe('P')

    nodes = patchNode<ElementNode>(nodes, h1Id, (node) => ({ ...node, tag: 'h2' }))
    renderer.sync(nodes, doc.rootId)
    expect(frameDoc.querySelector('h2')!.textContent).toBe('A')

    nodes = removeNode(nodes, pId)
    renderer.sync(nodes, doc.rootId)
    expect(frameDoc.body.innerHTML).not.toContain('<p')
  })
})
