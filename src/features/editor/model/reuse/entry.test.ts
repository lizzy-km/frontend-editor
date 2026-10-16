import { beforeEach, describe, expect, it } from 'vitest'
import { getDoc, useDocStore } from '../../store/doc.store'
import { parseHtmlDocument } from '../parse/parseDocument'
import { insertSubtree } from '../tree/treeOps'
import type { ElementNode } from '../types'
import { KEY_ATTR, LIBRARY_ATTR, VARIANT_ATTR, instancesOf, looksOf } from './attrs'
import { addEntry, entryFromComponent, keyLooks, linkOf, updateFromEntry } from './entry'
import { addLook } from './looks'
import { instantiate } from './make'
import { stripComponents } from './omit'
import { byTag, edit, mainChild, setText, setup, textOf } from './testKit'

beforeEach(() => useDocStore.getState().load(parseHtmlDocument('<body></body>')))

/** A "Card" with a "Dark" look and CSS, saved to a pretend library. */
function saved() {
  const { main } = setup()
  edit((nodes) => addLook(nodes, main, 'Dark')!.nodes)
  useDocStore.getState().commit({ ...getDoc(), nodes: keyLooks(getDoc().nodes, main), css: '.card { padding: 8px } .other { color: red } :root { --a: 1 }', links: ['https://fonts.example/x.css'] })
  return { main, entry: entryFromComponent(getDoc(), main) }
}

describe('account library entries', () => {
  it('keeps every look and only the CSS the component needs', () => {
    const { entry } = saved()
    expect(entry.looks).toHaveLength(2)
    expect(entry.css).toContain('.card { padding: 8px }')
    expect(entry.css).toContain(':root')
    expect(entry.css).not.toContain('.other')
    expect(Object.values(entry.looks[0]!.nodes).every((node) => node.kind === 'text' || (node as ElementNode).attrs[KEY_ATTR])).toBe(true)
  })

  it('adds a copy of the component to another page with its looks, CSS and links, linked to the entry', () => {
    const { entry } = saved()
    const page = parseHtmlDocument('<body><main id="m"></main></body>')
    const body = page.nodes[page.rootId] as ElementNode
    const added = addEntry({ ...page, css: '.mine { color: blue }' }, entry, 'lib1', 3, body.children[0]!, 0)!
    const looks = looksOf(added.doc.nodes, added.doc.nodes[added.id] as ElementNode)
    expect(looks.map((look) => look.attrs[VARIANT_ATTR])).toEqual(['Default', 'Dark'])
    expect(linkOf(looks[0])).toEqual({ id: 'lib1', version: 3 })
    expect(added.doc.css.startsWith('/* tweak-library:lib1 */')).toBe(true)
    expect(added.doc.css).toContain('.mine { color: blue }')
    expect(added.doc.links).toContain('https://fonts.example/x.css')
    expect(Object.keys(added.doc.nodes).some((id) => entry.looks.some((look) => id in look.nodes))).toBe(false)
  })

  it('updates in place: copies keep following the component and keep their own words', () => {
    const { entry } = saved()
    const page = parseHtmlDocument('<body><main id="m"></main></body>')
    const added = addEntry(page, entry, 'lib1', 1, (page.nodes[page.rootId] as ElementNode).children[0]!, 0)!
    useDocStore.getState().load(added.doc)
    const main = added.id
    const copy = setupCopy(main)
    setText(byTag(getDoc().nodes, 'h3', copy)[0]!.id, 'Mine')
    const newer = structuredClone(entry)
    for (const look of newer.looks) for (const node of Object.values(look.nodes)) if (node.kind === 'element' && node.tag === 'h3') node.styles = { desktop: { color: 'green' } }
    useDocStore.getState().commit(updateFromEntry(getDoc(), main, newer, 'lib1', 2))
    const after = getDoc().nodes
    expect(linkOf(after[main] as ElementNode)).toEqual({ id: 'lib1', version: 2 })
    expect(after[copy]).toBeTruthy()
    expect((byTag(after, 'h3', copy)[0] as ElementNode).styles.desktop?.color).toBe('green')
    expect(textOf(after, byTag(after, 'h3', copy)[0]!.id)).toBe('Mine')
    expect(mainChild('h3', main).styles.desktop?.color).toBe('green')
    expect(instancesOf(after, main)).toHaveLength(1)
  })

  it('leaves no trace in what visitors get', () => {
    const { entry } = saved()
    const page = parseHtmlDocument('<body><main id="m"></main></body>')
    const added = addEntry(page, entry, 'lib1', 1, (page.nodes[page.rootId] as ElementNode).children[0]!, 0)!
    const out = stripComponents(added.doc)
    expect(Object.values(out.nodes).some((node) => node.kind === 'element' && LIBRARY_ATTR in node.attrs)).toBe(false)
  })
})

/** One copy of a main component, put after it. */
function setupCopy(main: string): string {
  const copy = instantiate(getDoc().nodes, main)
  edit((nodes) => insertSubtree(nodes, copy.nodes, copy.topId, (nodes[main] as ElementNode).parentId!, 5))
  return copy.topId
}
