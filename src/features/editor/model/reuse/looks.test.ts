import { beforeEach, describe, expect, it } from 'vitest'
import { getDoc, useDocStore } from '../../store/doc.store'
import { parseHtmlDocument } from '../parse/parseDocument'
import { patchNode } from '../tree/treeOps'
import type { ElementNode } from '../types'
import { COMPONENT_ATTR, KEY_ATTR, PART_ATTR, VARIANT_ATTR, instancesOf, looksOf, mainsOf } from './attrs'
import { componentList } from './library'
import { addLook, deleteLook, partShown, partsOf, renameLook, setPartName, setPartShown, swapLook } from './looks'
import { renameComponent } from './make'
import { stripComponents } from './omit'
import { byTag, edit, instChild, mainChild, setText, setup, textOf } from './testKit'

beforeEach(() => useDocStore.getState().load(parseHtmlDocument('<body></body>')))

/** A "Card" with a second look "Dark" whose heading is red; returns the ids. */
function withDark() {
  const { main, instances } = setup()
  let dark = ''
  edit((nodes) => { const made = addLook(nodes, main, 'Dark')!; dark = made.id; return made.nodes })
  edit((nodes) => patchNode<ElementNode>(nodes, byTag(nodes, 'h3', dark)[0]!.id, (n) => ({ ...n, styles: { desktop: { color: 'red' } } })))
  return { main, dark, instances }
}

describe('looks (variants)', () => {
  it('a new look shares the name, has the same keys, and the first look is called Default', () => {
    const { main, dark } = withDark()
    const looks = looksOf(getDoc().nodes, getDoc().nodes[main] as ElementNode)
    expect(looks.map((look) => look.attrs[VARIANT_ATTR])).toEqual(['Default', 'Dark'])
    expect(looks.every((look) => look.attrs[COMPONENT_ATTR] === 'Card')).toBe(true)
    expect(byTag(getDoc().nodes, 'h3', main)[0]!.attrs[KEY_ATTR]).toBe(byTag(getDoc().nodes, 'h3', dark)[0]!.attrs[KEY_ATTR])
    expect(componentList(getDoc().nodes)).toHaveLength(1)
    expect(componentList(getDoc().nodes)[0]!.looks.map((look) => look.label)).toEqual(['Default', 'Dark'])
  })

  it('look names stay unique inside a component, and renaming the component renames every look', () => {
    const { main, dark } = withDark()
    edit((nodes) => addLook(nodes, main, 'Dark')!.nodes)
    expect(looksOf(getDoc().nodes, getDoc().nodes[main] as ElementNode).map((look) => look.attrs[VARIANT_ATTR])).toEqual(['Default', 'Dark', 'Dark 2'])
    edit((nodes) => renameLook(nodes, dark, 'Night'))
    edit((nodes) => renameComponent(nodes, main, 'Product card'))
    expect(mainsOf(getDoc().nodes).map((look) => [look.attrs[COMPONENT_ATTR], look.attrs[VARIANT_ATTR]])).toEqual([['Product card', 'Default'], ['Product card', 'Night'], ['Product card', 'Dark 2']])
  })

  it('a copy switches look and keeps what it changed itself, in the same place', () => {
    const { dark, instances } = withDark()
    const [copy, other] = instances() as [ElementNode, ElementNode]
    const parent = copy.parentId
    setText(instChild('h3', copy.id).id, 'My own title')
    edit((nodes) => patchNode<ElementNode>(nodes, instChild('img', copy.id).id, (n) => ({ ...n, attrs: { ...n.attrs, src: 'mine.png' } })))
    edit((nodes) => swapLook(nodes, copy.id, dark))
    const after = getDoc().nodes[copy.id] as ElementNode
    expect(after.attrs['data-fe-instance']).toBe(dark) // follows the Dark look now
    expect(after.parentId).toBe(parent)
    expect(instChild('h3', copy.id).styles.desktop).toEqual({ color: 'red' }) // the Dark look's design
    expect(textOf(getDoc().nodes, instChild('h3', copy.id).id)).toBe('My own title') // its own words kept
    expect(instChild('img', copy.id).attrs.src).toBe('mine.png') // its own picture kept
    // and it follows the Dark look from now on
    edit((nodes) => patchNode<ElementNode>(nodes, byTag(nodes, 'p', dark)[0]!.id, (n) => ({ ...n, styles: { desktop: { 'font-size': '30px' } } })))
    expect(instChild('p', copy.id).styles.desktop).toEqual({ 'font-size': '30px' })
    expect(instChild('p', other.id).styles.desktop ?? {}).toEqual({}) // the other copy still follows Default
  })

  it('each look carries its own changes to its own copies', () => {
    const { main, dark, instances } = withDark()
    edit((nodes) => swapLook(nodes, instances()[0]!.id, dark))
    setText(mainChild('p', main).id, 'Default words')
    expect(instancesOf(getDoc().nodes, main)).toHaveLength(1)
    expect(textOf(getDoc().nodes, instChild('p', instancesOf(getDoc().nodes, main)[0]!.id).id)).toBe('Default words')
    expect(textOf(getDoc().nodes, instChild('p', instancesOf(getDoc().nodes, dark)[0]!.id).id)).toBe('Words')
  })

  it('deleting a look moves its copies to the default look; the only look stays', () => {
    const { main, dark, instances } = withDark()
    edit((nodes) => swapLook(nodes, instances()[0]!.id, dark))
    edit((nodes) => deleteLook(nodes, dark))
    expect(getDoc().nodes[dark]).toBeUndefined()
    expect(instancesOf(getDoc().nodes, main)).toHaveLength(2)
    const same = getDoc().nodes
    expect(deleteLook(same, main)).toBe(same)
  })

  it('the outputs carry none of the bookkeeping', () => {
    withDark()
    const out = JSON.stringify(stripComponents(getDoc()).nodes)
    expect(out).not.toMatch(/data-fe-(key|variant|of|instance|component)/)
    expect(byTag(stripComponents(getDoc()).nodes, 'article')).toHaveLength(2)
  })
})

describe('parts (options)', () => {
  it('a named part can be shown or hidden in one copy', () => {
    const { main, instances } = setup()
    const picture = mainChild('img', main)
    edit((nodes) => setPartName(nodes, picture.id, 'Picture'))
    expect(partsOf(getDoc().nodes, main)).toEqual([{ id: picture.id, name: 'Picture' }])
    // copies learn the part name too (it is an ordinary attribute of the box)
    expect(instChild('img', instances()[0]!.id).attrs[PART_ATTR]).toBe('Picture')
    const [first, second] = instances()
    expect(partShown(getDoc().nodes, first!.id, picture.id)).toBe(true)
    edit((nodes) => setPartShown(nodes, first!.id, picture.id, false))
    expect(partShown(getDoc().nodes, first!.id, picture.id)).toBe(false)
    expect(partShown(getDoc().nodes, second!.id, picture.id)).toBe(true)
    expect(instChild('img', first!.id).hidden).toBe(true)
    edit((nodes) => setPartShown(nodes, first!.id, picture.id, true))
    expect(partShown(getDoc().nodes, first!.id, picture.id)).toBe(true)
    edit((nodes) => setPartName(nodes, picture.id, '  '))
    expect(partsOf(getDoc().nodes, main)).toEqual([])
  })
})
