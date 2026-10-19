import { filterChipsHtml } from '@/features/editor/model/widgets/blocksTable'
import { widget } from '../site'
import { TASKS } from './data'

const ANIM = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'
const source = { id: 'tasks', ...TASKS }

/** The tasks table from the `tasks` data, marked so the search bar and status buttons can narrow it. */
const taskTable = () => widget('table-data', { source }).replace('<table data-ui="table"', '<table data-ui-filterable="tasks" data-ui="table"')

/** The members-only dashboard: welcome, task table with search and status filter, calendar, and the "ask first" danger zone. */
export const DASHBOARD = `<section class="mb-sec" style="padding-top:40px"><div class="mb-wrap">`
  + `<div class="mb-welcome" ${ANIM}><div><h1>Welcome back to your workspace</h1><p>Ten tasks are in play this month. Three are due in the next week.</p></div><a class="mb-btn" href="/features">See what is new</a></div>`
  + '<div class="mb-dash"><div>'
  + `<div class="mb-card" ${ANIM}><h2 style="font-size:24px">Team tasks</h2><div class="mb-tools">${widget('search', { target: 'tasks' })}${filterChipsHtml('tasks', ['To do', 'Doing', 'Done'], 'status')}</div>${taskTable()}</div>`
  + `</div><aside><div class="mb-card" ${ANIM}><h3>Team calendar</h3><p>Pick a day to see what is due.</p>${widget('calendar')}</div></aside></div>`
  + `<div class="mb-card mb-danger" ${ANIM}><h3>Danger zone</h3><p>Deleting the workspace removes every task and every member for good.</p><button type="button" class="mb-btn mb-btn--danger" data-fe-ask="Delete everything? This cannot be undone.">Delete workspace</button></div>`
  + '</div></section>'
