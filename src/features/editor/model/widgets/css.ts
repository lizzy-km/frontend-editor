import type { WidgetKind } from './attrs'
import { BASE, MENU, TABLE, TABS } from './cssBase'
import { DATE, FIELD, FILTER, SEARCH, SELECT, SWITCH } from './cssForms'

const END = '/* /tweak-ui */'
const start = (group: string) => `/* tweak-ui ${group} */`

/** Which block of page CSS each widget needs (the calendar and the date picker share one). */
const GROUPS: Record<WidgetKind, { group: string; css: string }> = {
  tabs: { group: 'tabs', css: TABS }, menu: { group: 'menu', css: MENU }, table: { group: 'table', css: TABLE },
  field: { group: 'field', css: FIELD }, switch: { group: 'switch', css: SWITCH }, select: { group: 'select', css: SELECT },
  datepicker: { group: 'date', css: DATE }, calendar: { group: 'date', css: DATE },
  search: { group: 'search', css: SEARCH }, filter: { group: 'filter', css: FILTER },
}

/** Adds the look of a widget to the page CSS (once; the shared basics come with the first widget). */
export function addWidgetCss(css: string, kind: WidgetKind): string {
  let next = css
  for (const { group, css: block } of [{ group: 'base', css: BASE }, GROUPS[kind]]) {
    if (!next.includes(start(group))) next = `${next.trimEnd()}\n\n${start(group)}\n${block}\n${END}\n`
  }
  return next
}
