import type { PageDoc } from '../types'
import { widgetKindsIn } from './attrs'
import { WIDGET_SCRIPT } from './widgetScript'

/** Adds the widget script to a page that uses tabs, selects, calendars, tables with search… (nothing otherwise). */
export function withWidgets(doc: PageDoc): PageDoc {
  return widgetKindsIn(doc.nodes).size ? { ...doc, scripts: [...doc.scripts, { code: WIDGET_SCRIPT, inHead: false }] } : doc
}
