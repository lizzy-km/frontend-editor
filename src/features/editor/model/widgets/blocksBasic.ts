import { escapeHtml, MAIL_ICON, SEARCH_ICON } from './htmlBasics'

/** Ready-made tabs, dropdown menu and switches. Plain HTML; the first panel is open, the others carry `hidden`. */

export type TabsStyle = 'line' | 'pills' | 'boxed' | 'side'

const TAB_LABELS = ['Overview', 'Features', 'Pricing']
const TAB_TEXT = [
  'A short introduction. Change these words, add a picture, or put anything inside this panel.',
  'List what makes it special. Each tab has its own panel: select a tab on the page to see and edit it.',
  'Plans, prices or the next step. Visitors switch between panels by clicking the tabs or using the arrow keys.',
]

/** Tabs: a row of buttons and one panel for each. */
export function tabsHtml(style: TabsStyle = 'line'): string {
  const tabs = TAB_LABELS.map((label, i) =>
    `<button type="button" role="tab" class="ui-tab" data-ui-tab="tab-${i + 1}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${label}</button>`).join('')
  const panels = TAB_LABELS.map((label, i) =>
    `<div role="tabpanel" class="ui-panel" data-ui-panel="tab-${i + 1}"${i ? ' hidden' : ''}><h3 style="margin: 0 0 8px">${label}</h3><p style="margin: 0; color: #57534e">${TAB_TEXT[i]}</p></div>`).join('')
  return `<div data-ui="tabs" class="ui-tabs${style === 'line' ? '' : ` ui-tabs--${style}`}"><div role="tablist" class="ui-tablist">${tabs}</div>${panels}</div>`
}

/** A button that opens a small list of links; closes with Esc or a click outside. */
export const menuHtml = () =>
  '<details data-ui="menu" class="ui-menu"><summary data-ui-trigger>Options</summary><div class="ui-menu-panel">'
  + '<a href="#">Edit</a><a href="#">Duplicate</a><a href="#">Share</a><hr class="ui-menu-sep"><a href="#" class="ui-danger">Delete</a></div></details>'

/** An on/off switch. It is a real tick box, so forms send it like one. */
export const switchHtml = (kind: 'simple' | 'setting' = 'simple') => kind === 'simple'
  ? '<label data-ui="switch" class="ui-switch-row"><input type="checkbox" role="switch" class="ui-switch" name="notifications" checked><span>Email notifications</span></label>'
  : '<label data-ui="switch" class="ui-setting"><span><strong>Weekly summary</strong><small>A short email every Monday with what happened.</small></span><input type="checkbox" role="switch" class="ui-switch" name="summary" checked></label>'

export type FieldKind = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'search-icon'

const wrapIcon = (icon: string, control: string) => `<span data-ui-wrap class="ui-input-wrap ui-input-icon">${icon}${control}</span>`

/** A labelled input with help text. The variants differ in the control (password gets Show/Hide, number gets − and +). */
export function fieldHtml(kind: FieldKind = 'text', label = 'Your name'): string {
  const input = (type: string, extra = '') => `<input type="${type}" class="ui-input" name="${kind}" ${extra}>`
  const controls: Record<FieldKind, [string, string, string]> = {
    text: ['Your name', input('text', 'placeholder="Jane Doe" autocomplete="name"'), 'We use this on your receipt.'],
    email: ['Email', wrapIcon(MAIL_ICON, input('email', 'placeholder="jane@example.com" autocomplete="email"')), 'We never share it.'],
    password: ['Password', `<span data-ui-wrap class="ui-input-wrap">${input('password', 'placeholder="At least 8 characters" minlength="8" autocomplete="new-password" style="padding-right: 64px"')}<button type="button" class="ui-ghost" data-ui-reveal aria-pressed="false">Show</button></span>`, 'Use 8 or more characters.'],
    number: ['Quantity', `<span data-ui-wrap class="ui-stepper"><button type="button" data-ui-step="-1" aria-label="Fewer">−</button>${input('number', 'value="1" min="1" max="99"')}<button type="button" data-ui-step="1" aria-label="More">+</button></span>`, 'Between 1 and 99.'],
    textarea: ['Message', '<textarea class="ui-input" name="message" maxlength="300" rows="4" placeholder="How can we help?"></textarea>', ''],
    'search-icon': ['Search', wrapIcon(SEARCH_ICON, input('search', 'placeholder="Type to search…"')), ''],
  }
  const [defaultLabel, control, help] = controls[kind]
  const counter = kind === 'textarea' ? '<span class="ui-count" data-ui-count></span>' : ''
  return `<label data-ui="field" class="ui-field"><span class="ui-label">${escapeHtml(label === 'Your name' ? defaultLabel : label)}</span>${control}${counter}${help ? `<span class="ui-help">${help}</span>` : ''}</label>`
}
