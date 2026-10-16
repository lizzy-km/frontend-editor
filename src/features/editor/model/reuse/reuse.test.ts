import { beforeEach, describe, expect, it } from 'vitest'
import { getDoc, useDocStore } from '../../store/doc.store'
import { cloneSubtree } from '../tree/cloneSubtree'
import { insertSubtree, patchNode, removeNode } from '../tree/treeOps'
import { parseHtmlDocument } from '../parse/parseDocument'
import type { ElementNode } from '../types'
import { componentAround, instancesOf, mainsOf } from './attrs'
import { canMakeComponent } from './make'
import { propagate } from './propagate'
import { byTag, edit, el, instChild, mainChild, setText, setup, textOf } from './testKit'

beforeEach(() => useDocStore.getState().load(parseHtmlDocument('<body></body>')))

describe('making components and instances', () => {
  it('marks a box as the main component and copies it as instances that point back at it', () => {
    const { main, instances } = setup()
    expect(mainsOf(getDoc().nodes).map((n) => n.attrs['data-fe-component'])).toEqual(['Card'])
    expect(instances()).toHaveLength(2)
    const first = instances()[0]!
    expect(first.attrs['data-fe-instance']).toBe(main)
    expect(first.attrs).not.toHaveProperty('data-fe-component')
    expect(textOf(getDoc().nodes, first.id)).toBe('Title Words')
    expect(byTag(getDoc().nodes, 'h3', first.id)[0]!.attrs['data-fe-of']).toBe(mainChild('h3', main).id)
    expect(componentAround(getDoc().nodes, instChild('img', first.id).id)).toMatchObject({ kind: 'instance' })
  })

  it('refuses the page, and boxes that already are, or hold, a component', () => {
    const { main, instances } = setup()
    const nodes = getDoc().nodes
    expect(canMakeComponent(nodes, getDoc().rootId, getDoc().rootId)).toBe(false)
    expect(canMakeComponent(nodes, main, getDoc().rootId)).toBe(false)
    expect(canMakeComponent(nodes, instances()[0]!.id, getDoc().rootId)).toBe(false)
    expect(canMakeComponent(nodes, el(nodes, (n) => n.attrs.id === 'shell').id, getDoc().rootId)).toBe(false)
  })
})

describe('changes to the main component reach the instances', () => {
  it('words, pictures, styles and hiding follow the main component', () => {
    const { main, instances } = setup()
    setText(mainChild('h3', main).id, 'New title')
    edit((nodes) => patchNode<ElementNode>(nodes, mainChild('img', main).id, (n) => ({ ...n, attrs: { ...n.attrs, src: 'b.png' } })))
    edit((nodes) => patchNode<ElementNode>(nodes, mainChild('p', main).id, (n) => ({ ...n, styles: { desktop: { color: 'red' } }, hidden: true })))
    for (const instance of instances()) {
      expect(textOf(getDoc().nodes, byTag(getDoc().nodes, 'h3', instance.id)[0]!.id)).toBe('New title')
      expect(instChild('img', instance.id).attrs.src).toBe('b.png')
      expect(instChild('p', instance.id).styles.desktop).toEqual({ color: 'red' })
      expect(instChild('p', instance.id).hidden).toBe(true)
    }
  })

  it('keeps what an instance changed itself, and still follows the rest', () => {
    const { main, instances } = setup()
    const [first, second] = instances()
    setText(instChild('h3', first!.id).id, 'My own title')
    edit((nodes) => patchNode<ElementNode>(nodes, instChild('img', first!.id).id, (n) => ({ ...n, attrs: { ...n.attrs, src: 'mine.png' } })))
    setText(mainChild('h3', main).id, 'Shared title')
    setText(mainChild('p', main).id, 'Shared words')
    edit((nodes) => patchNode<ElementNode>(nodes, mainChild('img', main).id, (n) => ({ ...n, attrs: { ...n.attrs, src: 'shared.png' } })))
    const nodes = getDoc().nodes
    expect(textOf(nodes, instChild('h3', first!.id).id)).toBe('My own title') // overridden: kept
    expect(instChild('img', first!.id).attrs.src).toBe('mine.png') // overridden: kept
    expect(textOf(nodes, instChild('p', first!.id).id)).toBe('Shared words') // not overridden: follows
    expect(textOf(nodes, instChild('h3', second!.id).id)).toBe('Shared title')
    expect(instChild('img', second!.id).attrs.src).toBe('shared.png')
  })

  it('a style an instance changed stays, other styles of the same box follow', () => {
    const { main, instances } = setup()
    const first = instances()[0]!
    edit((nodes) => patchNode<ElementNode>(nodes, instChild('h3', first.id).id, (n) => ({ ...n, styles: { desktop: { color: 'blue' } } })))
    edit((nodes) => patchNode<ElementNode>(nodes, mainChild('h3', main).id, (n) => ({ ...n, styles: { desktop: { color: 'red', 'font-size': '30px' } } })))
    expect(instChild('h3', first.id).styles.desktop).toEqual({ color: 'blue', 'font-size': '30px' })
  })

  it('boxes added to the main component appear in every instance, and removed ones disappear', () => {
    const { main, instances } = setup()
    const extra = parseHtmlDocument('<body><button>Buy</button></body>')
    const button = el(extra.nodes, (n) => n.tag === 'button')
    edit((nodes) => insertSubtree(nodes, extra.nodes, button.id, main))
    for (const instance of instances()) expect(textOf(getDoc().nodes, instance.id)).toBe('Title Words Buy')
    edit((nodes) => removeNode(nodes, mainChild('p', main).id))
    for (const instance of instances()) {
      expect(textOf(getDoc().nodes, instance.id)).toBe('Title Buy')
      expect(byTag(getDoc().nodes, 'p', instance.id)).toHaveLength(0)
    }
  })

  it('is ONE undo step with the main component change', () => {
    const { main, instances } = setup()
    setText(mainChild('h3', main).id, 'Changed')
    expect(textOf(getDoc().nodes, instChild('h3', instances()[0]!.id).id)).toBe('Changed')
    useDocStore.getState().undo()
    expect(textOf(getDoc().nodes, instChild('h3', instances()[0]!.id).id)).toBe('Title')
    expect(textOf(getDoc().nodes, mainChild('h3', main).id)).toBe('Title')
  })

  it('a copy of an instance is an instance too', () => {
    const { main, instances } = setup()
    const first = instances()[0]!
    const copy = cloneSubtree(getDoc().nodes, first.id)
    edit((nodes) => insertSubtree(nodes, copy.nodes, copy.topId, first.parentId!))
    expect(instances()).toHaveLength(3)
    setText(mainChild('h3', main).id, 'For all')
    for (const instance of instances()) expect(textOf(getDoc().nodes, byTag(getDoc().nodes, 'h3', instance.id)[0]!.id)).toBe('For all')
  })

  it('deleting the main component turns the instances into normal boxes', () => {
    const { main } = setup()
    const first = instancesOf(getDoc().nodes, main)[0]!.id
    edit((nodes) => removeNode(nodes, main))
    expect(instancesOf(getDoc().nodes, main)).toHaveLength(0)
    expect((getDoc().nodes[first] as ElementNode).attrs).not.toHaveProperty('data-fe-instance')
    expect(byTag(getDoc().nodes, 'h3', first)[0]!.attrs).not.toHaveProperty('data-fe-of')
  })

  it('each instance keeps its own data choice', () => {
    const { main, instances } = setup()
    const [first, second] = instances()
    edit((nodes) => patchNode<ElementNode>(nodes, first!.id, (n) => ({ ...n, attrs: { ...n.attrs, 'data-fe-record': 'products', 'data-fe-row': '2' } })))
    edit((nodes) => patchNode<ElementNode>(nodes, main, (n) => ({ ...n, attrs: { ...n.attrs, class: 'card wide' } })))
    expect((getDoc().nodes[first!.id] as ElementNode).attrs).toMatchObject({ class: 'card wide', 'data-fe-record': 'products', 'data-fe-row': '2' })
    expect((getDoc().nodes[second!.id] as ElementNode).attrs).not.toHaveProperty('data-fe-record')
  })

  it('copies you have not touched follow the data of the main component; a copy where you chose another item keeps it', () => {
    const { main, instances } = setup()
    const [first, second] = instances()
    edit((nodes) => patchNode<ElementNode>(nodes, second!.id, (n) => ({ ...n, attrs: { ...n.attrs, 'data-fe-record': 'products', 'data-fe-row': '3' } })))
    edit((nodes) => patchNode<ElementNode>(nodes, main, (n) => ({ ...n, attrs: { ...n.attrs, 'data-fe-record': 'products', 'data-fe-row': 'first' } })))
    expect((getDoc().nodes[first!.id] as ElementNode).attrs).toMatchObject({ 'data-fe-record': 'products', 'data-fe-row': 'first' })
    expect((getDoc().nodes[second!.id] as ElementNode).attrs).toMatchObject({ 'data-fe-record': 'products', 'data-fe-row': '3' })
  })

  it('does nothing (and returns the same nodes) when no main component changed', () => {
    setup()
    const nodes = getDoc().nodes
    expect(propagate(nodes, nodes)).toBe(nodes)
    const other = patchNode<ElementNode>(nodes, el(nodes, (n) => n.attrs.id === 'shell').id, (n) => ({ ...n, attrs: { ...n.attrs, 'aria-label': 'x' } }))
    expect(propagate(nodes, other)).toBe(other)
  })
})
