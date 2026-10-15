import { rowTypeName } from '@/features/editor/model/data'
import { listAround } from '@/features/editor/model/dataLists'
import { isRecordBox, recordInfo, type RowChoice } from '@/features/editor/model/dataRecords'
import { collectSubtreeIds } from '@/features/editor/model/tree/queries'
import { isElement, type DataSource, type ElementNode, type NodeMap } from '@/features/editor/model/types'
import { formComponents } from '../forms/formTemplates'
import { motionImports, motionState, newShow, showImport } from '../jsxExtras'
import { writeElement, type JsxContext } from '../jsxWriter'
import { listComponents, usedFields, type ListOptions } from '../listTemplates'

type ComponentFile = { name: string; code: string; ids?: string[] }
type TakeName = (wanted: string, alternative?: string) => string

const pascal = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

/** The row a record box shows, as the argument of use<Source>Record(). */
const whichLiteral = (row: RowChoice) => (row.kind === 'number' ? String(row.n) : row.kind === 'param' ? `{ param: ${JSON.stringify(row.name)} }` : "'first'")

function recordFile(parent: JsxContext, box: ElementNode, source: DataSource, name: string, takeName: TakeName, data: ListOptions): ComponentFile[] {
  const info = recordInfo(parent.nodes, box.id)!
  const type = rowTypeName(source.name)
  const fields = usedFields(parent.nodes, box.id, source)
  const ctx: JsxContext = {
    nodes: parent.nodes, classFor: parent.classFor, motion: motionState(), show: newShow(),
    row: new Map(source.fields.map((field) => [field.name, field.type])),
  }
  // Lists and forms inside the box are components of their own, as everywhere else.
  const lists = listComponents({ nodes: parent.nodes, classFor: parent.classFor }, box.id, takeName, data)
  const forms = formComponents({ nodes: parent.nodes, classFor: parent.classFor }, box.id, takeName, data.base)
  ctx.lists = lists.lists
  ctx.forms = forms.forms
  const body = writeElement(ctx, box.id, '    ')
  const imports = [...lists.lists.values(), ...forms.forms.values()].map((component) => `import ${component} from './${component}'`)
  const hook = `use${pascal(source.name)}Record`
  return [{
    name,
    ids: [box.id],
    code: [
      ...motionImports(ctx.motion, data.base), ...showImport(ctx.show, data.base),
      `import { ${hook} } from '${data.base}/api/${source.name}'`,
      `import type { ${type} } from '${data.base}/data/types'`, ...imports, '',
      `/** One record of "${source.name}" (${info.row.kind === 'first' ? 'the first row' : info.row.kind === 'number' ? `row ${info.row.n}` : `the row whose id is in the page address: ?${info.row.name}=…`}). The words and pictures come from its fields. */`,
      `export default function ${name}() {`,
      `  const query = ${hook}(${whichLiteral(info.row)})`,
      '  if (query.isPending) return <p>Loading…</p>',
      `  const ${fields.length ? `{ ${fields.join(', ')} }` : '_record'} = query.data ?? ({} as Partial<${type}>)`,
      '  return (', body, '  )', '}', '',
    ].join('\n'),
  }, ...lists.files, ...forms.files]
}

/** Finds the "one record" boxes in a part and writes a component for each (React Query hook + typed fields). */
export function recordComponents(ctx: JsxContext, rootId: string, takeName: TakeName, data: ListOptions) {
  const records = new Map<string, string>()
  const files: ComponentFile[] = []
  for (const id of collectSubtreeIds(ctx.nodes, rootId)) {
    const box = ctx.nodes[id]
    if (!isRecordBox(box) || !isElement(box) || listAround(ctx.nodes, id) || [...records.keys()].some((outer) => collectSubtreeIds(ctx.nodes, outer).includes(id))) continue
    const source = data.sources.find((item) => item.name === recordInfo(ctx.nodes, id)?.source)
    if (!source) continue
    const name = takeName(`${rowTypeName(source.name)}Record`)
    files.push(...recordFile(ctx, box, source, name, takeName, data))
    records.set(id, name)
  }
  return { records, files }
}

/** Does anything in the project show a record (so the data files must exist even without a list)? */
export const usesRecords = (nodes: NodeMap) => Object.values(nodes).some(isRecordBox)
