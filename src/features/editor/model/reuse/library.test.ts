import { beforeEach, describe, expect, it } from 'vitest'
import { addCodeToDoc } from '../addCode'
import { parseHtmlDocument } from '../parse/parseDocument'
import { getDoc, useDocStore } from '../../store/doc.store'
import { isElement, type ElementNode } from '../types'
import { COMPONENT_ATTR, instancesOf, mainsOf } from './attrs'
import { COMPONENT_STARTS, componentList, duplicateComponent } from './library'
import { makeComponent } from './make'
import { edit, setup } from './testKit'

beforeEach(() => useDocStore.getState().load(parseHtmlDocument('<body></body>')))

describe('the components panel', () => {
  it('lists the components with their copies', () => {
    const { main } = setup()
    expect(componentList(getDoc().nodes)).toEqual([{ id: main, name: 'Card', copies: instancesOf(getDoc().nodes, main).map((copy) => copy.id) }])
    expect(componentList(getDoc().nodes)[0]!.copies).toHaveLength(2)
  })

  it('duplicating makes another main component with its own name and no copies', () => {
    const { main } = setup()
    const made = duplicateComponent(getDoc().nodes, main)!
    edit(() => made.nodes)
    const names = mainsOf(getDoc().nodes).map((node) => node.attrs[COMPONENT_ATTR])
    expect(names).toEqual(['Card', 'Card copy'])
    expect(instancesOf(getDoc().nodes, made.id)).toHaveLength(0)
    expect(instancesOf(getDoc().nodes, main)).toHaveLength(2)
    expect(duplicateComponent(getDoc().nodes, 'missing')).toBeNull()
  })

  it('deleting the main component keeps the copies as normal boxes', () => {
    const { main, instances } = setup()
    const first = instances()[0]!.id
    edit((nodes) => { const next = { ...nodes }; delete next[main]; const parent = next[nodes[main]!.parentId!] as ElementNode; next[parent.id] = { ...parent, children: parent.children.filter((id) => id !== main) }; return next })
    expect(mainsOf(getDoc().nodes)).toHaveLength(0)
    expect((getDoc().nodes[first] as ElementNode).attrs).not.toHaveProperty('data-fe-instance')
  })

  it('every start is one box that becomes a component', () => {
    for (const start of COMPONENT_STARTS) {
      const doc = parseHtmlDocument(`<body>${start.html}</body>`)
      const body = doc.nodes[doc.rootId] as ElementNode
      expect(body.children.filter((id) => isElement(doc.nodes[id])), start.id).toHaveLength(1)
      expect(Object.values(makeComponent(doc.nodes, body.children[0]!, start.name)).some((node) => isElement(node) && COMPONENT_ATTR in node.attrs)).toBe(true)
    }
    expect(new Set(COMPONENT_STARTS.map((start) => start.id)).size).toBe(COMPONENT_STARTS.length)
  })

  it('code with several top boxes is put into one box; one box stays as it is', () => {
    const doc = parseHtmlDocument('<body></body>')
    const target = { parentId: doc.rootId }
    const many = addCodeToDoc(doc, { html: '<h2>A</h2><p>B</p>', css: 'h2{color:red}' }, target, true)
    const one = addCodeToDoc(doc, { html: '<section><h2>A</h2></section>' }, target, true)
    expect(many.ok && (many.doc.nodes[many.doc.rootId] as ElementNode).children).toHaveLength(1)
    expect(many.ok && many.doc.css).toContain('h2{color:red}')
    expect(one.ok && (one.doc.nodes[(one.doc.nodes[one.doc.rootId] as ElementNode).children[0]!] as ElementNode).tag).toBe('section')
    const plain = addCodeToDoc(doc, { html: '<h2>A</h2><p>B</p>' }, target)
    expect(plain.ok && (plain.doc.nodes[plain.doc.rootId] as ElementNode).children).toHaveLength(2)
  })
})
