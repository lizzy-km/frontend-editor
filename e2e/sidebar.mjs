// Sidebar: layers select/hide, add a block, paste more code, edit page CSS.
import { check, OUT, openExample } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
const sidebar = page.locator('aside').first()
const count = (selector) => frame.$$eval(selector, (els) => els.length)

// Layers: clicking a canvas element reveals and highlights its row
const card = await box('.card:nth-child(2) h3')
await page.mouse.move(card.x + 5, card.y + 5)
await page.mouse.click(card.x + 5, card.y + 5)
await page.waitForTimeout(400)
const selectedRow = sidebar.locator('[role="treeitem"][aria-selected="true"]')
check('selected layer revealed', (await selectedRow.textContent()).includes('Croissants'), await selectedRow.textContent())
await page.screenshot({ path: OUT + 'sidebar-layers.png' })

// Hide from the layers list
await selectedRow.hover()
await selectedRow.getByRole('button', { name: 'Hide' }).click()
await page.waitForTimeout(200)
check('hidden element is faded in editor', await frame.$eval('.card:nth-child(2) h3', (el) => el.hasAttribute('data-fe-hidden')))
await selectedRow.getByRole('button', { name: 'Show' }).click()

// Add a button after the selected heading
await sidebar.getByRole('tab', { name: 'Add' }).click()
const before = await count('a')
await sidebar.getByRole('button', { name: 'Button' }).click()
await page.waitForTimeout(300)
check('button added', (await count('a')) === before + 1)
check('new button selected', await page.getByRole('toolbar', { name: 'Quick actions' }).isVisible())

// Paste more code (a whole AI reply)
await sidebar.getByLabel('Paste more code').fill('Here:\n```html\n<section class="pricing"><h2>Prices</h2><p>From $5</p></section>\n```')
await sidebar.getByRole('button', { name: 'Add this code' }).click()
await page.waitForTimeout(300)
check('pasted section added', (await count('.pricing h2')) === 1)

// Code tab: edit page CSS
await sidebar.getByRole('tab', { name: 'Code' }).click()
const cssBox = sidebar.getByLabel('Styles (CSS)')
await cssBox.fill((await cssBox.inputValue()) + '\nfooter { color: rgb(255, 0, 0); }')
await sidebar.getByRole('tab', { name: 'Layers' }).click() // blur -> save
await page.waitForTimeout(300)
check('page CSS edit applies', (await frame.$eval('footer', (el) => getComputedStyle(el).color)) === 'rgb(255, 0, 0)')

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
