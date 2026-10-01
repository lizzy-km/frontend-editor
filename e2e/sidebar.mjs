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

// Code tab: CodeMirror editor, CSS applies live (no click-away needed)
await sidebar.getByRole('tab', { name: 'Code' }).click()

// Code boxes collapse / expand from their headers
const cssHeader = sidebar.getByRole('button', { name: /^Styles \(CSS\)/ })
const htmlHeader = sidebar.getByRole('button', { name: /^Page code/ })
check('Page code starts open', (await htmlHeader.getAttribute('aria-expanded')) === 'true')
check('Styles start closed', (await cssHeader.getAttribute('aria-expanded')) === 'false')
check('closed box shows its size', /\d+ lines/.test(await cssHeader.textContent()), await cssHeader.textContent())
const htmlEditor = sidebar.getByRole('textbox', { name: 'Page code' })
await htmlEditor.waitFor({ timeout: 8000 })
await htmlEditor.click()
await page.keyboard.press('Control+End')
await page.keyboard.insertText('<!-- not applied yet -->')
await htmlHeader.click()
check('collapsing hides the editor', !(await htmlEditor.isVisible()))
await htmlHeader.click()
check('unapplied code survives collapse', (await htmlEditor.textContent()).includes('not applied yet'))
await sidebar.getByRole('button', { name: 'Discard' }).click()
await cssHeader.click()

const cssEditor = sidebar.getByRole('textbox', { name: 'Styles (CSS)' })
await cssEditor.waitFor({ timeout: 8000 }) // CodeMirror loads on demand
check('code editor has line numbers', await sidebar.locator('.cm-lineNumbers').first().isVisible())
await cssEditor.click()
await page.keyboard.press('Control+End')
await page.keyboard.press('Enter')
await page.keyboard.type('footer { color: rgb(255, 0, 0); }')
await page.waitForTimeout(900) // typing pause -> applied
check('page CSS edit applies while typing', (await frame.$eval('footer', (el) => getComputedStyle(el).color)) === 'rgb(255, 0, 0)')

// Undo from the page (outside the editor) also updates the editor's text
await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(400)
check('undo reverts the CSS', (await frame.$eval('footer', (el) => getComputedStyle(el).color)) !== 'rgb(255, 0, 0)')
check('editor text follows undo', !(await cssEditor.textContent()).includes('rgb(255, 0, 0)'))
await page.screenshot({ path: OUT + 'sidebar-code.png' })

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
