import { describe, expect, it } from 'vitest'
import { addSource } from '../data'
import { DATA_PRESETS } from '../dataPresets'
import { parseHtmlDocument } from '../parse/parseDocument'
import { getTextContent } from '../tree/queries'
import { isElement, type ElementNode, type PageDoc } from '../types'
import { addTab, changeColumns, changeRows, optionLines, removeTab, setOptions, setTabsStyle, tabsOf, toggleClass } from './edit'
import { filterTargets, nameTarget, pointAt } from './connect'
import { fieldValues, filterByField } from './filterData'
import { WIDGET_BLOCKS } from './registry'

const source = addSource(parseHtmlDocument('<body></body>'), DATA_PRESETS[0]!.source).doc
const make = (...ids: string[]): PageDoc => {
  const doc = parseHtmlDocument(`<body>${ids.map((id) => WIDGET_BLOCKS.find((block) => block.id === id)!.html({ target: '', source: source.data![0] })).join('')}</body>`)
  return { ...doc, data: source.data }
}
const root = (doc: PageDoc, kind: string) => Object.values(doc.nodes).find((node): node is ElementNode => isElement(node) && node.attrs['data-ui'] === kind)!

describe('tabs', () => {
  it('adds a tab with its own panel, and removes it again', () => {
    const doc = make('tabs')
    const id = root(doc, 'tabs').id
    const more = addTab(doc.nodes, id)
    const { tabs, panels } = tabsOf(more, id)
    expect(tabs).toHaveLength(4)
    expect(panels).toHaveLength(4)
    expect(tabs.at(-1)!.attrs['data-ui-tab']).toBe(panels.at(-1)!.attrs['data-ui-panel'])
    expect(new Set(tabs.map((tab) => tab.attrs['data-ui-tab'])).size).toBe(4)
    expect(getTextContent(more, tabs.at(-1)!.id)).toBe('Tab 4')
    expect(panels.at(-1)!.attrs).toHaveProperty('hidden')
    expect(tabsOf(removeTab(more, id), id).tabs).toHaveLength(3)
  })

  it('keeps at least one tab, and opens the first when the open one is removed', () => {
    const doc = make('tabs')
    const id = root(doc, 'tabs').id
    let nodes = doc.nodes
    for (let i = 0; i < 5; i++) nodes = removeTab(nodes, id)
    expect(tabsOf(nodes, id).tabs).toHaveLength(1)
    expect(tabsOf(nodes, id).tabs[0]!.attrs['aria-selected']).toBe('true')
    expect(tabsOf(nodes, id).panels[0]!.attrs).not.toHaveProperty('hidden')
  })

  it('changes the look class and keeps the others', () => {
    const doc = make('tabs')
    const id = root(doc, 'tabs').id
    const pills = setTabsStyle(doc.nodes, id, 'pills')
    expect((pills[id] as ElementNode).attrs.class).toBe('ui-tabs ui-tabs--pills')
    expect((setTabsStyle(pills, id, 'line')[id] as ElementNode).attrs.class).toBe('ui-tabs')
  })
})

describe('select choices', () => {
  it('replaces the options, one per line, and reads them back', () => {
    const doc = make('select')
    const id = root(doc, 'select').id
    const next = setOptions(doc.nodes, id, ['Red', 'Green', '', 'Blue'])
    expect(optionLines(next, id)).toEqual(['Red', 'Green', 'Blue'])
    const values = Object.values(next).filter((node): node is ElementNode => isElement(node) && 'data-ui-option' in node.attrs).map((node) => node.attrs['data-value'])
    expect(values).toEqual(['Red', 'Green', 'Blue'])
  })
})

describe('tables', () => {
  const cells = (doc: PageDoc, tag: string) => Object.values(doc.nodes).filter((node) => isElement(node) && node.tag === tag).length
  it('adds and removes rows and columns, keeping at least one', () => {
    const doc = make('table')
    const id = root(doc, 'table').id
    const rows = cells(doc, 'tr')
    expect(cells({ ...doc, nodes: changeRows(doc.nodes, id, true) }, 'tr')).toBe(rows + 1)
    expect(cells({ ...doc, nodes: changeRows(doc.nodes, id, false) }, 'tr')).toBe(rows - 1)
    const wider = changeColumns(doc.nodes, id, true)
    expect(cells({ ...doc, nodes: wider }, 'th')).toBe(5)
    expect(cells({ ...doc, nodes: wider }, 'td')).toBe(cells(doc, 'td') + 5)
    let narrow = doc.nodes
    for (let i = 0; i < 8; i++) narrow = changeColumns(narrow, id, false)
    expect(cells({ ...doc, nodes: narrow }, 'th')).toBe(1)
  })

  it('toggles a look class', () => {
    const doc = make('table')
    const id = root(doc, 'table').id
    const on = toggleClass(doc.nodes, id, 'ui-table--striped', true)
    expect((on[id] as ElementNode).attrs.class).toContain('ui-table--striped')
    expect((toggleClass(on, id, 'ui-table--striped', false)[id] as ElementNode).attrs.class).not.toContain('striped')
  })
})

describe('filters from data', () => {
  const wired = () => {
    let doc = make('table-data', 'filter-chips')
    const target = filterTargets(doc.nodes)[0]!
    const filter = root(doc, 'filter')
    doc = { ...doc, nodes: pointAt(nameTarget(doc.nodes, target), filter.id, target.name) }
    return { doc, filterId: filter.id, name: target.name }
  }

  it('lists the distinct values of a field in order', () => {
    expect(fieldValues(source.data![0]!, 'inStock')).toEqual(['Yes', 'No'])
  })

  it('a field makes the choices its real values and binds the row design to it', () => {
    const { doc, filterId } = wired()
    const next = filterByField(doc, filterId, 'inStock')
    const chips = Object.values(next.nodes).filter((node): node is ElementNode => isElement(node) && 'data-ui-filter' in node.attrs)
    expect(chips.map((chip) => chip.attrs['data-ui-filter'])).toEqual(['', 'Yes', 'No'])
    expect((next.nodes[filterId] as ElementNode).attrs['data-ui-by']).toBe('inStock')
    const row = Object.values(next.nodes).find((node): node is ElementNode => isElement(node) && node.tag === 'tr' && 'data-fe-bind-data-inStock' in node.attrs)
    expect(row?.attrs['data-fe-bind-data-inStock']).toBe('inStock')
    expect((filterByField(next, filterId, '').nodes[filterId] as ElementNode).attrs).not.toHaveProperty('data-ui-by')
  })
})
