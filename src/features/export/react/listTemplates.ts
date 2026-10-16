import { rowTypeName } from '@/features/editor/model/data'
import { bindingsOf, isListBox, listInfo, type ListInfo } from '@/features/editor/model/dataLists'
import { GO_ATTR } from '@/features/editor/model/pages'
import { routeParams } from '@/features/editor/model/routes'
import { collectSubtreeIds } from '@/features/editor/model/tree/queries'
import { isElement, type DataSource, type ElementNode, type NodeMap } from '@/features/editor/model/types'
import { linkImport, linksFor, navigateHook, type RouterLinks } from './routerLinks'
import { motionImports, motionState, newShow, showImport, staggerItem } from './jsxExtras'
import { closeTag, openTag, writeElement, type JsxContext } from './jsxWriter'

type ComponentFile = { name: string; code: string; ids?: string[] }
type TakeName = (wanted: string, alternative?: string) => string
/** Where generated files reach src/ from ('..' in src/components, '../..' in src/components/<page>). */
/**
 * Where generated files reach src/ from, the data sources, and (collected while writing) the functions
 * that cards call when clicked: name -> the source whose row they get (src/data/handlers.ts).
 */
export type ListOptions = { base: string; sources: DataSource[]; router?: RouterLinks; handlers?: Map<string, DataSource> }

/** Ready-made: src/components/ui/InfiniteScroll.tsx, for any useXInfinite() hook. */
export const INFINITE_SCROLL = `import { useEffect, useRef, type ReactNode } from 'react'
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query'

type Page<T> = { items: T[]; nextPage: number | null }

type Props<T> = {
  /** The result of a useXInfinite() hook (src/api). */
  query: UseInfiniteQueryResult<InfiniteData<Page<T>, unknown>, Error>
  /** One item (give it a key). */
  render: (item: T) => ReactNode
  /** Shown when there is nothing to show. */
  empty?: ReactNode
}

/** Shows items page by page and loads the next page as the end scrolls into view. */
export default function InfiniteScroll<T>({ query, render, empty = <p>Nothing here yet.</p> }: Props<T>) {
  const end = useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query

  useEffect(() => {
    const target = end.current
    if (!target || !hasNextPage) return
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
    }, { rootMargin: '400px' })
    watcher.observe(target)
    return () => watcher.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (query.isPending) return <p style={{ gridColumn: '1 / -1' }}>Loading…</p>
  if (query.isError) {
    return (
      <p role="alert" style={{ gridColumn: '1 / -1' }}>
        Couldn't load this list. <button type="button" onClick={() => void query.refetch()}>Try again</button>
      </p>
    )
  }
  const items = query.data.pages.flatMap((page) => page.items)
  if (items.length === 0) return <>{empty}</>
  return (
    <>
      {items.map(render)}
      <div ref={end} aria-hidden="true" style={{ gridColumn: '1 / -1', width: '100%', height: 1 }} />
      {isFetchingNextPage && <p style={{ gridColumn: '1 / -1' }}>Loading more…</p>}
    </>
  )
}
`

const pascal = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

/** The fields a card design shows (its props). */
export function usedFields(nodes: NodeMap, templateId: string, source: DataSource): string[] {
  const names = new Set(source.fields.map((field) => field.name))
  const used = new Set<string>()
  for (const id of collectSubtreeIds(nodes, templateId)) {
    const node = nodes[id]
    if (isElement(node)) {
      for (const field of [...Object.values(bindingsOf(node)), ...(node.attrs[GO_ATTR] ? [node.attrs[GO_ATTR]] : [])]) {
        if (names.has(field)) used.add(field)
        // An address template ("/products/:id") uses the row's fields named in it.
        else if (field.startsWith('/')) routeParams(field).filter((name) => names.has(name)).forEach((name) => used.add(name))
      }
    }
  }
  return [...used]
}

function cardFile(ctx: JsxContext, info: ListInfo, source: DataSource, name: string, options: ListOptions): ComponentFile {
  const { base, router } = options
  const type = rowTypeName(source.name)
  const fields = usedFields(ctx.nodes, info.templateId!, source)
  // Links in a card stay plain <a>; a click on the whole card can open a page (navigate) or call a function with the row.
  const card: JsxContext = { nodes: ctx.nodes, classFor: ctx.classFor, links: linksFor(router), row: new Map(source.fields.map((field) => [field.name, field.type])), cardRow: true, motion: motionState(), show: newShow() }
  // A "one by one" list box: every card is a Motion item.
  const item = staggerItem(ctx.nodes[info.id] as ElementNode)
  if (item) card.motion!.items.set(info.templateId!, item)
  const body = writeElement(card, info.templateId!, '    ')
  const calls = [...(card.show?.ui ?? [])].filter((use) => use.startsWith('call:')).map((use) => use.slice(5))
  for (const call of calls) options.handlers?.set(call, source)
  const wholeRow = calls.length > 0 || Boolean(card.show?.ui.has('modalRow'))
  return {
    name,
    ids: [info.templateId!],
    code: [
      ...linkImport(card, router), ...motionImports(card.motion, base), ...showImport(card.show, base), `import type { ${type} } from '${base}/data/types'`, '',
      `/** One ${type} card. Change the design here; the words and pictures come from "${source.name}". */`,
      // A card that calls a function gets the whole row (row), and picks the fields it shows from it.
      ...(wholeRow
        ? [`export default function ${name}(row: ${type}) {`, ...(fields.length ? [`  const { ${fields.join(', ')} } = row`] : [])]
        : [`export default function ${name}(${fields.length ? `{ ${fields.join(', ')} }` : '_card'}: ${type}) {`]),
      ...navigateHook(card), '  return (', body, '  )', '}', '',
    ].join('\n'),
  }
}

function listFile(parent: JsxContext, info: ListInfo, source: DataSource, name: string, card: string, base: string): ComponentFile {
  const ctx: JsxContext = { nodes: parent.nodes, classFor: parent.classFor, motion: motionState() }
  const box = ctx.nodes[info.id] as ElementNode
  const hook = `use${pascal(source.name)}${info.load === 'scroll' ? 'Infinite' : ''}`
  const items = info.load === 'scroll'
    ? [`      <InfiniteScroll query={query} render={(item) => <${card} key={item.id} {...item} />} />`]
    : ['      {query.isPending && <p>Loading…</p>}', `      {query.data?.map((item) => <${card} key={item.id} {...item} />)}`]
  const opening = openTag(ctx, box) // first: it decides the motion imports
  return {
    name,
    ids: [info.id],
    code: [
      ...motionImports(ctx.motion, base),
      `import { ${hook} } from '${base}/api/${source.name}'`,
      ...(info.load === 'scroll' ? [`import InfiniteScroll from '${base}/components/ui/InfiniteScroll'`] : []),
      `import ${card} from './${card}'`, '',
      `/** ${pascal(source.name)} from the data${info.load === 'scroll' ? `, ${info.pageSize} at a time, more as visitors scroll` : ''}. */`,
      `export default function ${name}() {`,
      `  const query = ${hook}(${info.load === 'scroll' ? info.pageSize : ''})`,
      '  return (', `    ${opening}`, ...items, `    ${closeTag(ctx, box)}`, '  )', '}', '',
    ].join('\n'),
  }
}

/** Finds the "List from data" boxes in a part and writes a list + card component for each. */
export function listComponents(ctx: JsxContext, rootId: string, takeName: TakeName, options: ListOptions) {
  const { base, sources } = options
  const lists = new Map<string, string>()
  const files: ComponentFile[] = []
  for (const id of collectSubtreeIds(ctx.nodes, rootId)) {
    if (!isListBox(ctx.nodes[id])) continue
    const info = listInfo(ctx.nodes, id)
    const source = sources.find((item) => item.name === info?.source)
    if (!info?.templateId || !source) continue
    const card = takeName(`${rowTypeName(source.name)}Card`)
    const name = takeName(`${pascal(source.name)}List`)
    files.push(listFile(ctx, info, source, name, card, base), cardFile(ctx, info, source, card, options))
    lists.set(id, name)
  }
  return { lists, files }
}

/** The ready-made InfiniteScroll, when some list loads more as visitors scroll. */
export function listUiFiles(doc: { nodes: NodeMap; data?: DataSource[] }): Record<string, string> {
  const scrolls = Object.keys(doc.nodes).some((id) => listInfo(doc.nodes, id)?.load === 'scroll')
  return scrolls && doc.data?.length ? { 'src/components/ui/InfiniteScroll.tsx': INFINITE_SCROLL } : {}
}
