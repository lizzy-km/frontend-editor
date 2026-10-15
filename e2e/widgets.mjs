// Ready-made widgets: add each, then use them like a visitor in Preview (tabs, select, date picker, calendar, table sort, search, filter, switch, password).
import { check, openExample, openAddFolds } from './browser.mjs'

const { browser, page, frame, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
await page.locator('[aria-label="Project"]').getByRole('tab', { name: 'Add' }).click()
await openAddFolds(page)

const add = async (name) => {
  await page.evaluate(() => document.activeElement?.blur())
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
  await side.getByRole('button', { name, exact: true }).click()
  await page.waitForTimeout(350)
}
// A list from data first (so search and filter have something to act on), then the table that the search will pick up last
await add('Table')
for (const name of ['Search bar', 'Filter buttons', 'Tabs', 'Select with search', 'Date picker', 'Calendar', 'Switch', 'Password input', 'Number input', 'Dropdown menu']) await add(name)

// Editing: a closed tab panel is shown while its tab (or anything inside) is selected
const shown = (selector) => frame.$eval(selector, (el) => el.getClientRects().length > 0)
check('editing: only the first tab panel shows at first', (await shown('[data-ui-panel="tab-1"]')) && !(await shown('[data-ui-panel="tab-2"]')))
await page.locator('[aria-label="Project"]').getByRole('tab', { name: 'Layers' }).click()
for (let i = 0; i < 6; i++) { // open the tree down to the tab buttons
  const twisty = page.locator('aside').first().getByRole('treeitem').filter({ hasText: /^Box “Overview/ }).first().getByRole('button', { name: 'Expand' })
  if (await twisty.count()) await twisty.first().click()
  const inner = page.locator('aside').first().getByRole('treeitem').filter({ hasText: /^Box “Overview|^Box “Features/ })
  for (const index of Array.from({ length: await inner.count() }, (_, n) => n)) { const open = inner.nth(index).getByRole('button', { name: 'Expand' }); if (await open.count()) await open.first().click() }
}
await page.locator('aside').first().getByRole('treeitem').filter({ hasText: /^Button “Features/ }).first().click()
await page.waitForTimeout(400)
check('editing: selecting the Features tab shows its panel', (await shown('[data-ui-panel="tab-2"]')) && !(await shown('[data-ui-panel="tab-1"]')))
await page.locator('aside').first().getByRole('treeitem').filter({ hasText: 'Select' }).first().click().catch(() => {})
await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
await page.waitForTimeout(300)
check('editing: the panel closes again when nothing is selected', !(await shown('[data-ui-panel="tab-2"]')))

await page.getByRole('button', { name: 'Preview' }).click()
const view = page.frameLocator('iframe[title="Preview of your page"]')
await view.locator('[data-ui="tabs"]').waitFor()
const text = (selector) => view.locator(selector).first().innerText()

// Tabs
await view.getByRole('tab', { name: 'Features' }).click()
check('tabs: clicking a tab shows its panel', (await view.locator('[data-ui-panel="tab-2"]').isVisible()) && !(await view.locator('[data-ui-panel="tab-1"]').isVisible()))
await view.getByRole('tab', { name: 'Features' }).press('ArrowRight')
check('tabs: arrow keys move to the next tab', await view.locator('[data-ui-panel="tab-3"]').isVisible())

// Select with search
await view.locator('[data-ui="select"] [data-ui-trigger]').click()
check('select: the list opens', await view.locator('[data-ui="select"] [data-ui-popup]').isVisible())
await view.locator('[data-ui-search]').fill('ger')
check('select: search narrows the options', (await view.locator('[data-ui-option]:visible').count()) === 1)
await view.locator('[data-ui-option]:visible').click()
check('select: the choice fills the button and the hidden field', (await text('[data-ui-value]')) === 'Germany' && (await view.locator('[data-ui="select"] [data-ui-input]').inputValue()) === 'Germany')
check('select: the list closes', !(await view.locator('[data-ui="select"] [data-ui-popup]').isVisible()))

// Date picker + calendar
await view.locator('[data-ui="datepicker"] [data-ui-trigger]').click()
check('date picker: the calendar opens', await view.locator('[data-ui="datepicker"] [data-ui-popup]').isVisible())
const day = view.locator('[data-ui="datepicker"] [data-ui-day]:not([data-out])').nth(9)
const iso = await day.getAttribute('data-date')
await day.click()
check('date picker: picking a day fills the box', (await view.locator('[data-ui="datepicker"] [data-ui-input]').inputValue()) === iso, iso)
check('date picker: closes after picking', !(await view.locator('[data-ui="datepicker"] [data-ui-popup]').isVisible()))
await view.locator('[data-ui="datepicker"] [data-ui-input]').fill('2030-02-14')
await view.locator('[data-ui="datepicker"] [data-ui-input]').dispatchEvent('change')
await view.locator('[data-ui="datepicker"] [data-ui-trigger]').click()
check('date picker: typing a date moves the calendar', (await text('[data-ui="datepicker"] [data-ui-title]')).includes('2030'))
await page.keyboard.press('Escape')
const before = await text('[data-ui="calendar"] [data-ui-title]')
await view.locator('[data-ui="calendar"] [data-ui-next]').click()
check('calendar: next month changes the title', (await text('[data-ui="calendar"] [data-ui-title]')) !== before)
await view.locator('[data-ui="calendar"] [data-ui-day]:not([data-out])').nth(14).click()
check('calendar: a clicked day is selected and shown', (await view.locator('[data-ui="calendar"] [data-ui-day][aria-selected="true"]').count()) === 1 && !(await text('[data-ui="calendar"] [data-ui-output]')).includes('Pick'))

// Table sort, search, filter
const firstCell = () => view.locator('table[data-ui="table"] tbody tr').first().locator('td').first().innerText()
await view.locator('th[data-ui-sort]').first().click()
const ascending = await firstCell()
await view.locator('th[data-ui-sort]').first().click()
check('table: clicking a heading sorts both ways', ascending !== (await firstCell()))
await view.locator('[data-ui="search"] input').fill('lamp')
check('search: only matching rows stay', (await view.locator('table[data-ui="table"] tbody tr:visible').count()) === 1)
await view.locator('[data-ui="search"] input').fill('')
await view.locator('[data-ui="filter"] [data-ui-filter="Home"]').click()
check('filter: a button keeps only that type', (await view.locator('table[data-ui="table"] tbody tr:visible').count()) === 2)
await view.locator('[data-ui="filter"] [data-ui-filter=""]').click()
check('filter: All shows everything again', (await view.locator('table[data-ui="table"] tbody tr:visible').count()) === 5)

// Switch, password, number, menu
await view.locator('.ui-switch').click()
check('switch: clicking turns it off', !(await view.locator('.ui-switch').isChecked()))
await view.locator('[data-ui-reveal]').click()
check('password: Show reveals the text', (await view.locator('input[name="password"]').getAttribute('type')) === 'text')
await view.locator('[data-ui-step="1"]').click()
check('number: + adds one', (await view.locator('input[name="number"]').inputValue()) === '2')
await view.locator('details[data-ui="menu"] summary').click()
check('menu: opens', await view.locator('.ui-menu-panel').isVisible())
await view.locator('body').click({ position: { x: 5, y: 5 } })
check('menu: a click outside closes it', !(await view.locator('.ui-menu-panel').isVisible()))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
