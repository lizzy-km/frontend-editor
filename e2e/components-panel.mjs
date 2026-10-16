// The Components panel: create from a start and from my own code, rename, add copies, see where they are used, duplicate, delete.
import { check, inspectorTab, openAddFolds, openExample } from './browser.mjs'

const { browser, page, frame, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
const rail = (name) => side.getByRole('tab', { name }).click().then(() => page.waitForTimeout(250))
const frameCount = async (selector) => (await frame.$$(selector)).length

await rail('Components')
check('empty at first', await side.getByText('None yet').isVisible())

// A new component from a start
await side.getByRole('button', { name: 'Card', exact: true }).click()
await page.waitForTimeout(500)
check('the card component is listed', (await side.getByLabel('Component name').inputValue()) === 'Card')
check('it sits on the page as the main component', (await frameCount('[data-fe-component="Card"]')) === 1)
await side.getByRole('button', { name: 'Add a copy' }).click(); await page.waitForTimeout(400)
await side.getByRole('button', { name: 'Add a copy' }).click(); await page.waitForTimeout(400)
check('two copies were added', (await frameCount('[data-fe-instance]')) === 2)
await side.getByRole('button', { name: '2 copies' }).click()
check('the list shows where the copies are', (await side.locator('ul ul li button').count()) === 2)
await side.locator('ul ul li button').first().click()
await page.waitForTimeout(300)
await inspectorTab(page, 'Actions')
check('clicking a copy selects it', (await page.locator('aside').last().innerText()).includes('A copy of'))

// Rename: the Add panel lists the new name
await rail('Components')
const name = side.getByLabel('Component name')
await name.fill('Product card'); await name.press('Enter'); await page.waitForTimeout(400)
await rail('Add'); await openAddFolds(page)
check('the new name shows in Add → Your components', await side.getByRole('button', { name: 'Product card' }).isVisible())
await rail('Components')

// Duplicate and delete
await side.getByRole('button', { name: 'Duplicate' }).click(); await page.waitForTimeout(400)
check('duplicating makes a second component', (await side.getByLabel('Component name').count()) === 2)
await side.getByRole('button', { name: 'Delete' }).last().click()
check('delete asks first and says the copies stay', await side.getByText('copies stay').isVisible() || await side.getByText('copy stays').isVisible())
await side.getByRole('button', { name: 'Keep it' }).click()
await side.getByRole('button', { name: 'Delete' }).first().click()
await side.getByRole('button', { name: 'Delete the component' }).click(); await page.waitForTimeout(500)
check('the main component is gone, its two copies stay as normal boxes', (await frameCount('[data-fe-component="Product card"]')) === 0 && (await frameCount('[data-fe-instance]')) === 0 && (await frameCount('article')) >= 2)

// From my own code: two top boxes + CSS become ONE component and the CSS joins the page
await side.getByRole('button', { name: 'From my code…' }).click()
const dialog = page.getByRole('dialog')
await dialog.getByLabel('Name').fill('Notice')
await dialog.getByLabel('Paste HTML').click()
await page.keyboard.insertText('<h4 class="note-title">Heads up</h4><p class="note-text">Read this</p>')
await dialog.getByRole('tab', { name: /CSS/ }).click()
await dialog.getByLabel('Paste CSS').click()
await page.keyboard.insertText('.note-title { color: rgb(0, 0, 255) }')
await dialog.getByRole('button', { name: 'Make the component' }).click()
await page.waitForTimeout(700)
check('a component made from code is listed as Notice', (await side.getByLabel('Component name').last().inputValue()) === 'Notice')
check('its two boxes are inside one main component', (await frameCount('[data-fe-component="Notice"] .note-title')) === 1 && (await frameCount('[data-fe-component="Notice"] .note-text')) === 1)
check('its CSS is applied', (await frame.$eval('.note-title', (el) => getComputedStyle(el).color)) === 'rgb(0, 0, 255)')
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
