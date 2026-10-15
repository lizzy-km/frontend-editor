import { track } from '@/features/analytics/track'
import { toast } from '@/shared/ui'
import { DATA_PRESETS } from '../model/dataPresets'
import { htmlToChildNodes } from '../model/parse/domToNodes'
import { insertSubtree } from '../model/tree/treeOps'
import type { DataSource, NodeMap } from '../model/types'
import { addWidgetCss } from '../model/widgets/css'
import { filterTargets, nameTarget } from '../model/widgets/connect'
import type { WidgetBlock } from '../model/widgets/registry'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { updateDoc } from './commit'
import { createSource } from './dataActions'
import { resolveInsertTarget } from './contentActions'

/**
 * Adds a ready-made widget (tabs, select, table, search…): its page CSS and its boxes in ONE undo step.
 * A search or filter is connected to the first list or table on the page right away.
 */
export function insertWidget(block: WidgetBlock): string | null {
  let source: DataSource | undefined
  if (block.needsData) {
    if (!getDoc().data?.length) createSource(DATA_PRESETS[0]!.source, 'Products (for a table)')
    source = getDoc().data![0]
  }
  const target = block.connects ? filterTargets(getDoc().nodes)[0] : undefined
  if (block.connects && !target) toast('Add a list or a table first, then connect this in its settings.', 'info')
  const where = resolveInsertTarget()
  const created: NodeMap = {}
  const ids = htmlToChildNodes(block.html({ target: target?.name ?? '', source }), where.parentId, created)
  updateDoc((doc) => {
    let nodes = doc.nodes
    ids.forEach((id, offset) => { nodes = insertSubtree(nodes, created, id, where.parentId, where.index === undefined ? undefined : where.index + offset) })
    if (target) nodes = nameTarget(nodes, target)
    return { ...doc, css: addWidgetCss(doc.css, block.kind), nodes }
  })
  track('add_block', { block: block.id })
  const first = ids.find((id) => created[id]?.kind === 'element') ?? null
  if (first) useSelectionStore.getState().select(first)
  return first
}
