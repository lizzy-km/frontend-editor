import { beforeEach, describe, expect, it } from 'vitest'
import { getDoc, useDocStore } from '../../store/doc.store'
import { parseHtmlDocument } from '../parse/parseDocument'
import { forVisitors } from '../serialize/forVisitors'
import { patchNode } from '../tree/treeOps'
import type { ElementNode, PageDoc } from '../types'
import { buildReactProject } from '@/features/export/react/buildReactProject'
import { instancesOf, mainsOf } from './attrs'
import { detachInstance, releaseComponent, resetInstance } from './make'
import { stripComponents } from './omit'
import { HTML, byTag, edit, instChild, mainChild, setText, setup, textOf } from './testKit'

beforeEach(() => useDocStore.getState().load(parseHtmlDocument('<body></body>')))

describe('reset, detach, release and the outputs', () => {
  it('reset brings an instance back to the main component and keeps its data choice', () => {
    const { instances } = setup()
    const first = instances()[0]!
    setText(instChild('h3', first.id).id, 'Mine')
    edit((nodes) => patchNode<ElementNode>(nodes, first.id, (n) => ({ ...n, attrs: { ...n.attrs, 'data-fe-record': 'products', 'data-fe-row': '3' } })))
    edit((nodes) => resetInstance(nodes, first.id))
    expect(textOf(getDoc().nodes, instChild('h3', first.id).id)).toBe('Title')
    expect((getDoc().nodes[first.id] as ElementNode).attrs['data-fe-row']).toBe('3')
    expect(getDoc().nodes[first.id]!.parentId).toBe(instances()[1]!.parentId)
  })

  it('detach stops following; release returns the main component and its instances to normal boxes', () => {
    const { main, instances } = setup()
    const first = instances()[0]!
    edit((nodes) => detachInstance(nodes, first.id))
    setText(mainChild('h3', main).id, 'Later')
    expect(textOf(getDoc().nodes, instChild('h3', first.id).id)).toBe('Title')
    edit((nodes) => releaseComponent(nodes, main))
    expect(mainsOf(getDoc().nodes)).toHaveLength(0)
    expect(instancesOf(getDoc().nodes, main)).toHaveLength(0)
  })

  it('Preview and downloads leave the main component out and keep the instances (without bookkeeping)', () => {
    setup()
    const stripped: PageDoc = stripComponents(getDoc())
    expect(byTag(stripped.nodes, 'article')).toHaveLength(2)
    expect(JSON.stringify(stripped.nodes)).not.toMatch(/data-fe-(of|instance|component)/)
    const out = forVisitors(getDoc())
    expect(byTag(out.nodes, 'article')).toHaveLength(2)
    const plain = parseHtmlDocument(HTML)
    expect(stripComponents(plain)).toBe(plain) // nothing to leave out: the same page
  })

  it('the React download writes the copies as plain parts and never the main component', () => {
    setup()
    const files = buildReactProject(getDoc())
    const code = Object.entries(files).filter(([path]) => path.startsWith('src/')).map(([, text]) => text).join(' ')
    expect(code.match(/<h3>Title<\/h3>/g)).toHaveLength(2) // the two copies; the main component is left out
    expect(code).not.toMatch(/data-fe-(of|instance|component)/)
    expect(files['.tweak/project.json']).toBeUndefined() // the snapshot is added by the download action, not here
  })
})
