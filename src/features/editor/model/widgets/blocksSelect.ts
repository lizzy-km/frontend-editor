import { CALENDAR_ICON, CHEVRON, escapeHtml } from './htmlBasics'

/** The select list and the calendar / date picker. */

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Japan']

/** A select list: a button that opens options. A hidden field carries the choice to forms. `search` adds a search box. */
export function selectHtml(search = false): string {
  const options = (search ? COUNTRIES : COUNTRIES.slice(0, 4)).map((country) => `<li role="option" class="ui-option" data-ui-option data-value="${escapeHtml(country)}" aria-selected="false">${country}</li>`).join('')
  const box = search ? '<input type="search" class="ui-search" data-ui-search placeholder="Search…" aria-label="Search the list">' : ''
  const empty = search ? '<li class="ui-empty" data-ui-empty hidden>No matches</li>' : ''
  return '<div data-ui="select" class="ui-select"><span class="ui-label">Country</span>'
    + `<button type="button" class="ui-select-trigger" data-ui-trigger aria-haspopup="listbox" aria-expanded="false"><span data-ui-value data-empty>Choose one</span>${CHEVRON}</button>`
    + `<div class="ui-popup" data-ui-popup hidden>${box}<ul role="listbox" class="ui-options">${options}${empty}</ul></div>`
    + '<input type="hidden" name="country" data-ui-input></div>'
}

const pad = (n: number) => String(n).padStart(2, '0')
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** The month grid for a date: 42 day buttons (Monday first). The script moves months by changing their numbers. */
function calendarBody(today: Date, output: boolean): string {
  const first = new Date(today.getFullYear(), today.getMonth(), 1)
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() + 6) % 7))
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const iso = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
    const out = day.getMonth() !== first.getMonth() ? ' data-out' : ''
    const now = day.toDateString() === today.toDateString() ? ' data-today' : ''
    return `<button type="button" class="ui-day" data-ui-day data-date="${iso}" aria-selected="false" tabindex="-1"${out}${now}>${day.getDate()}</button>`
  }).join('')
  const title = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return '<div class="ui-cal-head"><button type="button" class="ui-cal-nav" data-ui-prev aria-label="Previous month">‹</button>'
    + `<strong data-ui-title>${title}</strong><button type="button" class="ui-cal-nav" data-ui-next aria-label="Next month">›</button></div>`
    + `<div class="ui-cal-week" aria-hidden="true">${WEEKDAYS.map((day) => `<span data-ui-weekday>${day}</span>`).join('')}</div>`
    + `<div class="ui-cal-grid" role="grid">${days}</div>`
    + `<div class="ui-cal-foot">${output ? '<span data-ui-output>Pick a day</span>' : '<span></span>'}<button type="button" data-ui-today>Today</button></div>`
}

/** A month calendar visitors can click to pick a day (Monday first; change it in the settings). */
export const calendarHtml = (today = new Date()) =>
  `<div data-ui="calendar" data-ui-cal data-ui-week="1" class="ui-cal ui-cal--card">${calendarBody(today, true)}</div>`

/** A date box with a calendar that opens under it. Typing a date works too. */
export const datePickerHtml = (today = new Date()) =>
  '<div data-ui="datepicker" data-ui-format="YYYY-MM-DD" data-ui-week="1" class="ui-date"><span class="ui-label">Date</span>'
  + `<span class="ui-input-wrap"><input type="text" class="ui-input" name="date" data-ui-input placeholder="YYYY-MM-DD" autocomplete="off" style="padding-right: 44px"><button type="button" class="ui-ghost" data-ui-trigger aria-label="Open the calendar" aria-expanded="false" style="display: grid; place-items: center; width: 34px; height: 34px; padding: 0">${CALENDAR_ICON.replace('<svg ', '<svg style="width: 18px; height: 18px" ')}</button></span>`
  + `<div class="ui-popup" data-ui-popup hidden><div class="ui-cal" data-ui-cal>${calendarBody(today, false)}</div></div></div>`
