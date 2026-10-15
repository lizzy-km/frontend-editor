import { describe, expect, it } from 'vitest'
import { revealChanges } from '@/features/editor/canvas/useRevealWidgets'
import { buildReactProject } from '@/features/export/react/buildReactProject'
import { parseHtmlDocument } from '../parse/parseDocument'
import { forVisitors } from '../serialize/forVisitors'
import { addSource } from '../data'
import { DATA_PRESETS } from '../dataPresets'
import { isElement, type ElementNode } from '../types'
import { widgetKindsIn } from './attrs'
import { addWidgetCss } from './css'
import { filterTargets, nameTarget, pointAt } from './connect'
import { WIDGET_BLOCKS } from './registry'

const source = addSource(parseHtmlDocument('<body></body>'), DATA_PRESETS[0]!.source).doc.data![0]!
const docWith = (...ids: string[]) => parseHtmlDocument(`<body>${ids.map((id) => WIDGET_BLOCKS.find((block) => block.id === id)!.html({ target: '', source })).join('')}</body>`)
const elements = (doc: ReturnType<typeof docWith>) => Object.values(doc.nodes).filter((node): node is ElementNode => isElement(node))

describe('ready-made widgets', () => {
  it('every block is plain HTML that parses with its widget marker', () => {
    for (const block of WIDGET_BLOCKS) {
      const doc = docWith(block.id)
      expect(widgetKindsIn(doc.nodes).has(block.kind), block.id).toBe(true)
    }
  })

  it('has unique ids and every block names an everyday label', () => {
    expect(new Set(WIDGET_BLOCKS.map((block) => block.id)).size).toBe(WIDGET_BLOCKS.length)
    for (const block of WIDGET_BLOCKS) expect(block.label.length, block.id).toBeGreaterThan(2)
  })

  it('tabs: the first panel is open and the others are hidden, each tab points at a panel', () => {
    const nodes = elements(docWith('tabs'))
    const tabs = nodes.filter((node) => node.attrs['data-ui-tab'])
    const panels = nodes.filter((node) => node.attrs['data-ui-panel'])
    expect(tabs.map((tab) => tab.attrs['data-ui-tab'])).toEqual(panels.map((panel) => panel.attrs['data-ui-panel']))
    expect(panels.map((panel) => 'hidden' in panel.attrs)).toEqual([false, true, true])
    expect(tabs.map((tab) => tab.attrs['aria-selected'])).toEqual(['true', 'false', 'false'])
  })

  it('a select carries its choice to forms in a hidden field', () => {
    const nodes = elements(docWith('select-search'))
    expect(nodes.some((node) => node.tag === 'input' && node.attrs.type === 'hidden' && 'data-ui-input' in node.attrs)).toBe(true)
    expect(nodes.filter((node) => 'data-ui-option' in node.attrs).length).toBeGreaterThan(4)
  })

  it('a calendar has 42 day buttons and a date picker keeps its calendar in a closed pop-over', () => {
    expect(elements(docWith('calendar')).filter((node) => 'data-ui-day' in node.attrs)).toHaveLength(42)
    const picker = elements(docWith('datepicker'))
    expect(picker.find((node) => 'data-ui-popup' in node.attrs)?.attrs).toHaveProperty('hidden')
  })

  it('adds the look of a widget to the page CSS once, with the shared basics', () => {
    const once = addWidgetCss('', 'tabs')
    expect(once).toContain('/* tweak-ui base */')
    expect(once).toContain('/* tweak-ui tabs */')
    expect(addWidgetCss(once, 'tabs')).toBe(once)
    const both = addWidgetCss(addWidgetCss('', 'calendar'), 'datepicker')
    expect(both.match(/\/\* tweak-ui date \*\//g)).toHaveLength(1)
  })
})

describe('search and filters', () => {
  it('finds lists and tables, names them without clashes, and points widgets at them', () => {
    const doc = parseHtmlDocument(`<body>${WIDGET_BLOCKS.find((b) => b.id === 'table-data')!.html({ target: '', source })}${WIDGET_BLOCKS.find((b) => b.id === 'table')!.html({ target: '', source })}${WIDGET_BLOCKS.find((b) => b.id === 'search')!.html({ target: '', source })}${WIDGET_BLOCKS.find((b) => b.id === 'filter-checks')!.html({ target: '', source })}</body>`)
    const targets = filterTargets(doc.nodes)
    expect(targets).toHaveLength(2) // the data table once (not its rows box), and the typed table
    expect(new Set(targets.map((target) => target.name)).size).toBe(2)
    const named = nameTarget(doc.nodes, targets[0]!)
    expect((named[targets[0]!.id] as ElementNode).attrs['data-ui-filterable']).toBe(targets[0]!.name)
    const filter = elements(doc).find((node) => node.attrs['data-ui'] === 'filter')!
    const pointed = pointAt(doc.nodes, filter.id, 'products')
    const reset = Object.values(pointed).find((node) => isElement(node) && 'data-ui-reset' in node.attrs) as ElementNode
    expect((pointed[filter.id] as ElementNode).attrs['data-ui-for']).toBe('products')
    expect(reset.attrs['data-ui-reset']).toBe('products')
  })
})

describe('where the script goes', () => {
  it('Preview and downloads get the widget script only when a widget is used', () => {
    const plain = forVisitors(parseHtmlDocument('<body><p>Hi</p></body>'))
    expect(plain.scripts.some((script) => script.code?.includes('data-ui-tab'))).toBe(false)
    const used = forVisitors(docWith('tabs'))
    expect(used.scripts.some((script) => script.code?.includes('data-ui-tab'))).toBe(true)
  })

  it('the React download carries src/widgets.ts and imports it, and keeps the data-ui hooks', () => {
    const files = buildReactProject(docWith('tabs', 'select'))
    expect(files['src/widgets.ts']).toContain('selectTab')
    expect(files['src/main.tsx']).toContain("import './widgets'")
    expect(JSON.stringify(files)).toContain('data-ui-tab')
    expect(buildReactProject(parseHtmlDocument('<body><p>Hi</p></body>'))['src/widgets.ts']).toBeUndefined()
  })
})

describe('editing closed parts', () => {
  it('selecting a tab panel shows it, hides the others and marks its tab', () => {
    const doc = docWith('tabs')
    const second = elements(doc).find((node) => node.attrs['data-ui-panel'] === 'tab-2')!
    const changes = revealChanges(doc.nodes, second.id)
    const hiddenOf = (key: string) => changes.find((change) => change.name === 'hidden' && (doc.nodes[change.id] as ElementNode).attrs['data-ui-panel'] === key)?.value
    expect(hiddenOf('tab-2')).toBeNull()
    expect(hiddenOf('tab-1')).toBe('')
    expect(changes.filter((change) => change.name === 'aria-selected' && change.value === 'true')).toHaveLength(1)
  })

  it('selecting a select list or a date box shows its pop-over', () => {
    for (const id of ['select', 'datepicker']) {
      const doc = docWith(id)
      const root = elements(doc).find((node) => node.attrs['data-ui'] === id)!
      expect(revealChanges(doc.nodes, root.id).some((change) => change.name === 'hidden' && change.value === null)).toBe(true)
    }
  })
})
