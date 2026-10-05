import type { ElementNode, NodeMap } from '@/features/editor/model/types'
import { writeElement, type JsxContext, type RepeatSlot } from './jsxWriter'
import { lowerFirst, pascalCase } from './names'
import { findRepeats, type PropValue, type RepeatGroup } from './repeats'

type ClassFor = (node: ElementNode) => string | undefined
type TakeName = (wanted: string, alternative?: string) => string

/** One .tsx file in src/components. */
export type ComponentFile = { name: string; code: string }

const BODY_PAD = '    '

const rowLiteral = (row: Record<string, PropValue>) =>
  `  { ${Object.entries(row).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(', ')} },`

/** An item component: typed props, the item's markup with the props filled in. */
function itemComponent(nodes: NodeMap, classFor: ClassFor, group: RepeatGroup, name: string): ComponentFile {
  const ctx: JsxContext = { nodes, classFor, props: group.fields }
  const fields = group.props.map((prop) => `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.kind}`)
  const params = group.props.map((prop) => prop.name).join(', ')
  return {
    name,
    code: [
      `export type ${name}Props = {`, ...fields, '}', '',
      `/** One of the repeated items. Change the look here; change the words in the list that uses it. */`,
      `export default function ${name}({ ${params} }: ${name}Props) {`,
      '  return (', writeElement(ctx, group.ids[0]!, BODY_PAD), '  )', '}', '',
    ].join('\n'),
  }
}

/**
 * The component for one part of the page (header, a section, the footer).
 * Repeated items inside it become their own component plus a typed list.
 */
export function partComponent(nodes: NodeMap, classFor: ClassFor, rootId: string, name: string, takeName: TakeName): ComponentFile[] {
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
    items.push(itemComponent(nodes, classFor, group, itemName))
    imports.push(`import ${itemName}, { type ${itemName}Props } from './${itemName}'`)
    lists.push(`const ${listName}: ${itemName}Props[] = [`, ...group.rows.map(rowLiteral), ']', '')
    repeats.set(group.ids[0]!, { ids: group.ids, expression: `{${listName}.map((item, index) => <${itemName} key={index} {...item} />)}` })
  }

  const ctx: JsxContext = { nodes, classFor, repeats }
  const code = [
    ...imports, ...(imports.length ? [''] : []),
    ...lists,
    `export default function ${name}() {`,
    '  return (', writeElement(ctx, rootId, BODY_PAD), '  )', '}', '',
  ].join('\n')
  return [{ name, code }, ...items]
}
