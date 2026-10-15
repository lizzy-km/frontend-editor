// Search bar and filter wired to "List from data" and to "Table from data", and a filter that offers a data field's real values.
import { check, inspectorTab, openExample, openAddFolds } from './browser.mjs'

const { browser, page, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
await page.locator('[aria-label="Project"]').getByRole('tab', { name: 'Add' }).click()
await openAddFolds(page)
const add = async (name) => {
  await page.evaluate(() => document.activeElement?.blur())
  for (let i = 0; i < 3; i++) await page.keyboard.press('Escape')
  await side.getByRole('button', { name, exact: true }).click()
  await page.waitForTimeout(400)
}
const settings = page.locator('aside').last()

// A list from data, then a search and a filter that connect to it by themselves
await add('List from data')
await add('Search bar')
await inspectorTab(page, 'Actions')
check('search bar settings name the list it works on', (await settings.getByLabel('Works on').inputValue()).length > 0)
await add('Filter buttons')
await inspectorTab(page, 'Actions')
await settings.getByLabel('Filter by').selectOption('inStock')
await page.waitForTimeout(300)
check('filtering by a field turns the buttons into its values', (await settings.getByLabel('Filter by').inputValue()) === 'inStock')

// A table from data; the search can be pointed at it in its settings
await add('Table from data')
await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
await add('Search bar')
await inspectorTab(page, 'Actions')
const options = await settings.getByLabel('Works on').locator('option').allInnerTexts()
check('the search can work on the list or the table', options.some((text) => text.includes('Cards from')) && options.some((text) => text.includes('A table')), options.join(' | '))
await settings.getByLabel('Works on').selectOption({ label: 'A table' })
await page.waitForTimeout(300)

await page.getByRole('button', { name: 'Preview' }).click()
const view = page.frameLocator('iframe[title="Preview of your page"]')
await view.locator('[data-ui="search"]').first().waitFor()
const cards = () => view.locator('article.data-card:visible').count()
const rows = () => view.locator('table[data-ui="table"] tbody tr:visible').count()
check('the list shows every item at first', (await cards()) === 6, String(await cards()))
check('the table shows every item at first', (await rows()) === 6, String(await rows()))

await view.locator('[data-ui="search"]').first().locator('input').fill('lamp')
check('search narrows the list', (await cards()) === 1 && (await rows()) === 6, `${await cards()} cards, ${await rows()} rows`)
await view.locator('[data-ui="search"]').first().locator('input').fill('')
const chips = await view.locator('[data-ui="filter"] [data-ui-filter]').allInnerTexts()
check('the filter offers the field’s real values', chips.join('|') === 'All|Yes|No', chips.join('|'))
await view.locator('[data-ui="filter"] [data-ui-filter="No"]').click()
check('the filter keeps the items with that value', (await cards()) === 1, String(await cards()))
await view.locator('[data-ui="filter"] [data-ui-filter="Yes"]').click()
check('the other value keeps the rest', (await cards()) === 5, String(await cards()))
await view.locator('[data-ui="filter"] [data-ui-filter=""]').click()
check('All shows everything again', (await cards()) === 6)

await view.locator('[data-ui="search"]').nth(1).locator('input').fill('lamp')
check('the second search narrows the table', (await rows()) === 1 && (await cards()) === 6, `${await rows()} rows, ${await cards()} cards`)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
