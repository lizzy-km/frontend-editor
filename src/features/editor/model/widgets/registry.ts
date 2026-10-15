import type { IconName } from '@/shared/ui'
import type { DataSource } from '../types'
import type { WidgetKind } from './attrs'
import { fieldHtml, menuHtml, switchHtml, tabsHtml } from './blocksBasic'
import { calendarHtml, datePickerHtml, selectHtml } from './blocksSelect'
import { dataTableHtml, filterChecksHtml, filterChipsHtml, filterSelectHtml, searchHtml, tableHtml } from './blocksTable'

/** What a block needs when it is added: the list or table it will act on, or a data source. */
export type BlockContext = { target: string; source?: DataSource }

export type WidgetBlock = {
  id: string
  label: string
  hint: string
  icon: IconName
  kind: WidgetKind
  html: (context: BlockContext) => string
  /** Searches and filters connect to a list or table on the page. */
  connects?: boolean
  /** Needs a data source (sample data is added when there is none). */
  needsData?: boolean
}

export type WidgetGroup = { id: string; label: string; blocks: WidgetBlock[] }

const block = (id: string, label: string, hint: string, icon: IconName, kind: WidgetKind, html: WidgetBlock['html'], more: Partial<WidgetBlock> = {}): WidgetBlock => ({ id, label, hint, icon, kind, html, ...more })

/** Everything under Add → Inputs, tabs, tables… in the order people look for it. */
export const WIDGET_GROUPS: WidgetGroup[] = [
  {
    id: 'inputs', label: 'Inputs',
    blocks: [
      block('input-text', 'Text input', 'A labelled box for a short answer', 'input', 'field', () => fieldHtml('text')),
      block('input-email', 'Email input', 'With a mail icon; the browser checks the address', 'input', 'field', () => fieldHtml('email')),
      block('input-password', 'Password input', 'With a Show / Hide button', 'lock', 'field', () => fieldHtml('password')),
      block('input-number', 'Number input', 'With − and + buttons', 'input', 'field', () => fieldHtml('number')),
      block('input-textarea', 'Text area', 'A bigger box for a message, with a letter counter', 'pencil', 'field', () => fieldHtml('textarea')),
      block('switch', 'Switch', 'An on/off switch with a label', 'toggle', 'switch', () => switchHtml('simple')),
      block('switch-setting', 'Setting with switch', 'A title, a line of help and a switch', 'toggle', 'switch', () => switchHtml('setting')),
      block('select', 'Select', 'Choose one item from a list', 'select', 'select', () => selectHtml(false)),
      block('select-search', 'Select with search', 'A long list people can search', 'select', 'select', () => selectHtml(true)),
      block('datepicker', 'Date picker', 'A date box that opens a calendar', 'calendar', 'datepicker', () => datePickerHtml()),
    ],
  },
  {
    id: 'navigation', label: 'Tabs and menus',
    blocks: [
      block('tabs', 'Tabs', 'Underlined tabs, one panel each', 'tabs', 'tabs', () => tabsHtml('line')),
      block('tabs-pills', 'Pill tabs', 'Round tabs', 'tabs', 'tabs', () => tabsHtml('pills')),
      block('tabs-boxed', 'Boxed tabs', 'Tabs in a grey bar', 'tabs', 'tabs', () => tabsHtml('boxed')),
      block('tabs-side', 'Side tabs', 'Tabs down the left side', 'tabs', 'tabs', () => tabsHtml('side')),
      block('menu', 'Dropdown menu', 'A button that opens a list of links', 'menu', 'menu', () => menuHtml()),
      block('calendar', 'Calendar', 'A month calendar people can click', 'calendar', 'calendar', () => calendarHtml()),
    ],
  },
  {
    id: 'tables', label: 'Tables, search and filters',
    blocks: [
      block('table', 'Table', 'Rows and columns; click a heading to sort', 'table', 'table', () => tableHtml('simple')),
      block('table-striped', 'Striped table', 'Alternating rows, highlight on hover', 'table', 'table', () => tableHtml('striped')),
      block('table-team', 'Table with status', 'Status badges and a number column', 'table', 'table', () => tableHtml('team')),
      block('table-data', 'Table from data', 'One row for every item of your data', 'table', 'table', ({ source }) => dataTableHtml(source!), { needsData: true }),
      block('search', 'Search bar', 'Narrows a list or table as people type', 'search', 'search', ({ target }) => searchHtml(target), { connects: true }),
      block('filter-chips', 'Filter buttons', 'All / Clothing / Bags… buttons', 'filter', 'filter', ({ target }) => filterChipsHtml(target), { connects: true }),
      block('filter-select', 'Filter drop-down', 'Pick one choice from a list', 'filter', 'filter', ({ target }) => filterSelectHtml(target), { connects: true }),
      block('filter-checks', 'Filter tick boxes', 'Tick the choices to keep', 'filter', 'filter', ({ target }) => filterChecksHtml(target), { connects: true }),
    ],
  },
]

export const WIDGET_BLOCKS = WIDGET_GROUPS.flatMap((group) => group.blocks)
