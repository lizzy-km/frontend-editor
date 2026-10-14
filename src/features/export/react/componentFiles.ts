import type { ElementNode, NodeMap } from '@/features/editor/model/types'
import { writeElement, type JsxContext, type RepeatSlot } from './jsxWriter'
import { lowerFirst, pascalCase } from './names'
import { motionImports, motionState, newShow, showImport } from './jsxExtras'
import { formComponents } from './forms/formTemplates'
import { listComponents, type ListOptions } from './listTemplates'
import { findRepeats, type PropValue, type RepeatGroup } from './repeats'

type ClassFor = (node: ElementNode) => string | undefined
type TakeName = (wanted: string, alternative?: string) => string
/** Sites: page addresses that become router links, where Link/useNavigate come from, and how to call navigate. */
export type RouterLinks = { paths: Set<string>; lib: string; go: (target: string, typed: boolean) => string }

const linksFor = (router?: RouterLinks) => (router ? { paths: router.paths, lib: router.lib, used: false, navigate: false, go: router.go } : undefined)
/** `import { Link, useNavigate } from '…'` for what the file used. */
function linkImport(ctx: JsxContext, router?: RouterLinks): string[] {
  const names = [ctx.links?.used && 'Link', ctx.links?.navLink && 'NavLink', ctx.links?.navigate && 'useNavigate'].filter(Boolean)
  return names.length && router ? [`import { ${names.join(', ')} } from '${router.lib}'`] : []
}
/** The hook line for components with "click goes to" boxes. */
const navigateHook = (ctx: JsxContext) => (ctx.links?.navigate ? ['  const navigate = useNavigate()'] : [])

/** One .tsx file in src/components. */
export type ComponentFile = { name: string; code: string }

const BODY_PAD = '    '

const rowLiteral = (row: Record<string, PropValue>) =>
  `  { ${Object.entries(row).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(', ')} },`

/** An item component: typed props, the item's markup with the props filled in. */
function itemComponent(nodes: NodeMap, classFor: ClassFor, group: RepeatGroup, name: string, router?: RouterLinks, base = '..'): ComponentFile {
  const ctx: JsxContext = { nodes, classFor, props: group.fields, links: linksFor(router), motion: motionState(), show: newShow() }
  const body = writeElement(ctx, group.ids[0]!, BODY_PAD)
  const fields = group.props.map((prop) => `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.kind}`)
  const params = group.props.map((prop) => prop.name).join(', ')
  return {
    name,
    code: [
      ...linkImport(ctx, router), ...motionImports(ctx.motion, base), ...showImport(ctx.show, base), ...(ctx.links?.used || ctx.links?.navLink || ctx.motion?.animation || ctx.motion?.item || showImport(ctx.show, base).length ? [''] : []),
      `export type ${name}Props = {`, ...fields, '}', '',
      `/** One of the repeated items. Change the look here; change the words in the list that uses it. */`,
      `export default function ${name}({ ${params} }: ${name}Props) {`,
      ...navigateHook(ctx), '  return (', body, '  )', '}', '',
    ].join('\n'),
  }
}

/**
 * The component for one part of the page (header, a section, the footer).
 * Repeated items inside it become their own component plus a typed list.
 */
export function partComponent(nodes: NodeMap, classFor: ClassFor, rootId: string, name: string, takeName: TakeName, router?: RouterLinks, data?: ListOptions): ComponentFile[] {
  const groups = findRepeats(nodes, rootId, classFor)
  const repeats = new Map<string, RepeatSlot>()
  const items: ComponentFile[] = []
  const imports: string[] = []
  const lists: string[] = []

  for (const group of groups) {
    const base = pascalCase(group.baseName) || 'Item'
    // Taken already (two kinds of "Card")? Prefix the part's name, unless it is already there.
    const itemName = takeName(base, base.startsWith(name) ? undefined : `${name}${base}`)
    const listName = `${lowerFirst(itemName)}Items`
    items.push(itemComponent(nodes, classFor, group, itemName, router, data?.base))
    imports.push(`import ${itemName}, { type ${itemName}Props } from './${itemName}'`)
    lists.push(`const ${listName}: ${itemName}Props[] = [`, ...group.rows.map(rowLiteral), ']', '')
    repeats.set(group.ids[0]!, { ids: group.ids, expression: `{${listName}.map((item, index) => <${itemName} key={index} {...item} />)}` })
  }

  const ctx: JsxContext = { nodes, classFor, repeats, links: linksFor(router), motion: motionState(), show: newShow() }
  // "List from data" boxes become their own list + card components.
  const dataLists = data ? listComponents({ nodes, classFor }, rootId, takeName, data) : { lists: new Map<string, string>(), files: [] }
  ctx.lists = dataLists.lists
  items.push(...dataLists.files)
  // Forms set up in the editor become their own React Hook Form + Zod components.
  const forms = formComponents({ nodes, classFor }, rootId, takeName, data?.base ?? '..', router)
  ctx.forms = forms.forms
  items.push(...forms.files)
  const body = writeElement(ctx, rootId, BODY_PAD)
  const listImports = [...dataLists.lists.values(), ...forms.forms.values()].map((list) => `import ${list} from './${list}'`)
  const allImports = [...linkImport(ctx, router), ...motionImports(ctx.motion, data?.base ?? '..'), ...showImport(ctx.show, data?.base ?? '..'), ...listImports, ...imports]
  const code = [
    ...allImports, ...(allImports.length ? [''] : []),
    ...lists,
    `export default function ${name}() {`,
    ...navigateHook(ctx), '  return (', body, '  )', '}', '',
  ].join('\n')
  return [{ name, code }, ...items]
}
