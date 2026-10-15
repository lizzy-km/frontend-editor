import { BIND_ATTR, BIND_PREFIX, LIST_ATTR, LOAD_ATTR, PAGE_SIZE_ATTR } from '../dataLists'
import type { DataSource } from '../types'
import { escapeHtml, SEARCH_ICON } from './htmlBasics'

/** Ready-made tables, and the search bar and filters that can act on a list or a table. */

export type TableKind = 'simple' | 'striped' | 'team'

const head = (labels: string[], sortable: boolean) => `<thead><tr>${labels.map((label) => `<th scope="col"${sortable ? ' data-ui-sort tabindex="0"' : ''}>${escapeHtml(label)}</th>`).join('')}</tr></thead>`
const row = (cells: string[]) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
const wrap = (table: string) => `<div class="ui-table-wrap">${table}</div>`

const STATUS = { ok: '<span class="ui-badge ui-badge--ok">Active</span>', wait: '<span class="ui-badge ui-badge--wait">Invited</span>', off: '<span class="ui-badge ui-badge--off">Paused</span>' }

/** A table with sortable headings (click a heading to sort). Cells are normal text: edit them like any words. */
export function tableHtml(kind: TableKind = 'simple'): string {
  const extra = kind === 'simple' ? '' : kind === 'striped' ? ' ui-table--striped ui-table--hover' : ' ui-table--hover'
  if (kind === 'team') {
    const people = [['Ava Martin', 'Designer', STATUS.ok, '$4,200'], ['Noah Kim', 'Developer', STATUS.ok, '$5,100'], ['Mia Rossi', 'Marketing', STATUS.wait, '$3,600'], ['Leo Dubois', 'Support', STATUS.off, '$2,900']]
    return wrap(`<table data-ui="table" class="ui-table${extra}">${head(['Name', 'Role', 'Status', 'Salary'], true)}<tbody>${people.map((person) => row(person)).join('')}</tbody></table>`)
  }
  const items = [['Linen shirt', 'Clothing', '12', '$59'], ['Canvas tote', 'Bags', '34', '$29'], ['Ceramic mug', 'Home', '8', '$18'], ['Wool beanie', 'Clothing', '21', '$24'], ['Desk lamp', 'Home', '5', '$79']]
  return wrap(`<table data-ui="table" class="ui-table${extra}">${head(['Item', 'Type', 'In stock', 'Price'], true)}<tbody>${items.map((item) => row(item)).join('')}</tbody></table>`)
}

/** A table whose rows come from a data source: one row design repeated for every item. */
export function dataTableHtml(source: DataSource): string {
  const fields = source.fields.filter((field) => field.type !== 'longText').slice(0, 5)
  const cell = (field: DataSource['fields'][number]) => field.type === 'image'
    ? `<td><img ${BIND_PREFIX}src="${field.name}" alt="" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover"></td>`
    : `<td ${BIND_ATTR}="${field.name}">${escapeHtml(field.name)}</td>`
  return wrap(`<table data-ui="table" class="ui-table ui-table--hover">${head(fields.map((field) => field.name), true)}`
    + `<tbody ${LIST_ATTR}="${source.name}" ${PAGE_SIZE_ATTR}="50" ${LOAD_ATTR}="all"><tr>${fields.map(cell).join('')}</tr></tbody></table>`)
}

/** A search box that narrows a list or table as people type (connect it to one in the settings). */
export const searchHtml = (target = '') =>
  `<div data-ui="search" data-ui-for="${target}" class="ui-search-bar" role="search"><span data-ui-wrap class="ui-input-wrap ui-input-icon">${SEARCH_ICON}`
  + '<input type="search" class="ui-input" placeholder="Search…" aria-label="Search"><button type="button" class="ui-ghost" data-ui-clear>Clear</button></span></div>'

const CHOICES = ['Clothing', 'Bags', 'Home']

/** Filter buttons: "All" and one per choice; picking one shows only the matching items. */
export const filterChipsHtml = (target = '') =>
  `<div data-ui="filter" data-ui-kind="chips" data-ui-for="${target}" class="ui-filter" role="group" aria-label="Filter">`
  + `<button type="button" class="ui-chip" data-ui-filter="" aria-pressed="true">All</button>${CHOICES.map((name) => `<button type="button" class="ui-chip" data-ui-filter="${name}" aria-pressed="false">${name}</button>`).join('')}</div>`

/** A drop-down filter. */
export const filterSelectHtml = (target = '') =>
  `<div data-ui="filter" data-ui-kind="select" data-ui-for="${target}" class="ui-filter"><span class="ui-label">Show</span>`
  + `<select class="ui-input" aria-label="Filter"><option value="">Everything</option>${CHOICES.map((name) => `<option>${name}</option>`).join('')}</select></div>`

/** A box of tick boxes: items matching any ticked choice stay (nothing ticked = everything). */
export const filterChecksHtml = (target = '') =>
  `<div data-ui="filter" data-ui-kind="checks" data-ui-for="${target}" class="ui-filter-box" role="group" aria-label="Filter"><strong>Type</strong>`
  + `${CHOICES.map((name) => `<label class="ui-check"><input type="checkbox" value="${name}"> ${name}</label>`).join('')}`
  + '<button type="button" class="ui-chip" data-ui-reset="">Clear filters</button></div>'
