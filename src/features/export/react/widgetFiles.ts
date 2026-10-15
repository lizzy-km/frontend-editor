import { widgetKindsIn } from '@/features/editor/model/widgets/attrs'
import { WIDGET_SCRIPT } from '@/features/editor/model/widgets/widgetScript'
import type { NodeMap } from '@/features/editor/model/types'
import type { ExportFiles } from '../buildFiles'

/** Does the page use tabs, selects, calendars, tables with search…? */
export const usesWidgets = (nodes: NodeMap) => widgetKindsIn(nodes).size > 0

/**
 * `src/widgets.ts`: the same small script that powers Preview and the .html download. It listens for clicks
 * and keys on the whole page, so every ready-made part works, also on pages React shows later. It is plain
 * JavaScript on purpose: keep it, or replace a part with your own component or a library.
 */
export function widgetFiles(nodes: NodeMap): ExportFiles {
  if (!usesWidgets(nodes)) return {}
  return { 'src/widgets.ts': `// @ts-nocheck\n/** Behaviour of the ready-made parts (tabs, select, calendar, table sorting, search and filters). */\n${WIDGET_SCRIPT}\n\nexport {}\n` }
}
