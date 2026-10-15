import core from './runtime/core.js?raw'
import date from './runtime/date.js?raw'
import fields from './runtime/fields.js?raw'
import filter from './runtime/filter.js?raw'
import popups from './runtime/popups.js?raw'
import select from './runtime/select.js?raw'
import table from './runtime/table.js?raw'
import tabs from './runtime/tabs.js?raw'

const START = `startAll(document)
new MutationObserver(function (records) {
  records.forEach(function (record) {
    Array.prototype.forEach.call(record.addedNodes, function (node) { if (node.nodeType === 1) startAll(node) })
  })
}).observe(document.documentElement, { childList: true, subtree: true })`

/**
 * What makes the ready-made parts work for visitors (Preview, public view, .html downloads) and in
 * the React project (`src/widgets.ts`): one script listening for clicks and keys on the whole page,
 * so parts added later (React pages, list cards) work without extra setup.
 */
export const WIDGET_SCRIPT = `(function () {\n'use strict'\n${[core, popups, tabs, select, date, fields, table, filter, START].join('\n')}\n})()`
