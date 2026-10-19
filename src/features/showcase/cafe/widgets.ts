import { widget } from '../site'

/** Ready-made widgets from the editor, with our own words put in. */

/** Tabs (a ready-made style) with our own tab names and panels, in order. */
export function tabsWith(block: string, items: [label: string, html: string][]): string {
  let html = widget(block)
  const old = ['Overview', 'Features', 'Pricing']
  items.forEach(([label], index) => { html = html.replace(`>${old[index]}</button>`, `>${label}</button>`) })
  items.forEach(([, panel], index) => {
    const open = new RegExp(`(<div role="tabpanel" class="ui-panel" data-ui-panel="tab-${index + 1}"[^>]*>)[\\s\\S]*?</div>`)
    html = html.replace(open, (_, start: string) => `${start}${panel}</div>`)
  })
  return html
}

/** A ready-made table (sortable headings) with our own columns and rows. */
export function tableWith(block: string, heads: string[], rows: string[][]): string {
  const head = `<thead><tr>${heads.map((label) => `<th scope="col" data-ui-sort tabindex="0">${label}</th>`).join('')}</tr></thead>`
  const body = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`
  return widget(block).replace(/<thead>[\s\S]*<\/tbody>/, head + body)
}

/** The time-slot drop-down: the ready-made select with our own label, name and times. */
export function timeSelect(times: string[]): string {
  const options = times.map((time) => `<li role="option" class="ui-option" data-ui-option data-value="${time}" aria-selected="false">${time}</li>`).join('')
  return widget('select')
    .replace('>Country<', '>Time<').replace('name="country"', 'name="time" required')
    .replace(/(<ul role="listbox" class="ui-options">)[\s\S]*?<\/ul>/, `$1${options}</ul>`)
}

/** The guests counter: the ready-made number input, from 1 to 12, starting at 2. */
export function guestsInput(): string {
  return widget('input-number')
    .replace('>Quantity<', '>Guests<').replace('name="number"', 'name="guests" required').replace('value="1" min="1" max="99"', 'value="2" min="1" max="12"')
    .replace('Between 1 and 99.', 'Tables of up to 12. For more, call us.')
}

/** The date box: the ready-made date picker, a required field. */
export function dateInput(): string {
  return widget('datepicker').replace('>Date<', '>Day<').replace('name="date"', 'name="date" required')
}

/** The dietary switch: the ready-made "setting with switch", with our own words. */
export function dietSwitch(): string {
  return widget('switch-setting')
    .replace('Weekly summary', 'I have a dietary requirement').replace('A short email every Monday with what happened.', 'Allergies, vegan, gluten-free: tell us below and the kitchen will plan for you.')
    .replace('name="summary" checked', 'name="dietary"')
}
