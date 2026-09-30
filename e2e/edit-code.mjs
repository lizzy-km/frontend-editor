// Edit the pasted code: one part (quick action "Edit code") and the whole page (Code tab).
import { check, OUT, openExample } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()
const cardTitles = () => frame.$$eval('.card h3', (els) => els.map((el) => el.textContent))

/** Replace everything in the CodeMirror editor inside `scope` with `text`. */
async function replaceCode(scope, text) {
  await scope.locator('.cm-content').click()
  await page.keyboard.press('Control+a')
  await page.keyboard.press('Delete')
  await page.keyboard.insertText(text) // one input, so auto-closing tags don't interfere
}

// 1. Edit one card's code
const h3 = await box('.card:nth-child(2) h3')
await page.mouse.move(h3.x + 5, h3.y + 5)
await page.mouse.click(h3.x + 5, h3.y + 5)
await page.waitForTimeout(250)
await page.keyboard.press('Escape') // select the card around the heading
await page.waitForTimeout(250)
await page.getByRole('toolbar', { name: 'Quick actions' }).getByRole('button', { name: 'Edit code' }).click()
const dialog = page.locator('dialog[open]')
await dialog.locator('.cm-content').waitFor({ timeout: 8000 })
check('dialog shows the part’s code', (await dialog.locator('.cm-content').textContent()).includes('Croissants'))
await replaceCode(dialog, '<div class="card"><h3>Bagels</h3><p>Chewy and golden.</p></div>')
await page.screenshot({ path: OUT + 'edit-code-dialog.png' })
await dialog.getByRole('button', { name: 'Apply changes' }).click()
await page.waitForTimeout(400)
check('part replaced', JSON.stringify(await cardTitles()) === JSON.stringify(['Sourdough', 'Bagels', 'Cinnamon rolls']), (await cardTitles()).join(', '))
check('page CSS still styles the new part', (await frame.$eval('.card:nth-child(2)', (el) => getComputedStyle(el).borderRadius)) === '14px')
check('dialog closed after apply', (await page.$('dialog[open]')) === null)

await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(300)
check('undo brings the old part back', (await cardTitles())[1] === 'Croissants')

// 2. Edit the whole page HTML in the Code tab
const sidebar = page.locator('aside').first()
await sidebar.getByRole('tab', { name: 'Code' }).click()
const pageBox = sidebar.locator('.cm-editor', { has: page.getByRole('textbox', { name: 'Page HTML' }) })
await sidebar.locator('.cm-content').first().waitFor({ timeout: 8000 })
check('Apply is off until something changes', await sidebar.getByRole('button', { name: 'Apply changes' }).isDisabled())

// Fold / unfold
const pageTools = sidebar.getByRole('toolbar', { name: 'Page HTML tools' })
await pageTools.getByRole('button', { name: 'Fold all', exact: true }).click()
await page.waitForTimeout(200)
const folded = await pageBox.locator('.cm-foldPlaceholder').count()
check('Fold all collapses blocks', folded > 0, `${folded} folded`)
await page.screenshot({ path: OUT + 'edit-code-folded.png' })
await pageTools.getByRole('button', { name: 'Unfold all' }).click()
await page.waitForTimeout(200)
check('Unfold all expands them again', (await pageBox.locator('.cm-foldPlaceholder').count()) === 0)
check('fold arrows are in the gutter', (await pageBox.locator('.cm-foldGutter').count()) > 0)
await replaceCode(pageBox, '<main class="hero"><h1>Brand new page</h1></main>')
await sidebar.getByRole('button', { name: 'Apply changes' }).click()
await page.waitForTimeout(400)
check('whole page replaced', (await frame.$eval('body', (el) => el.textContent.trim())) === 'Brand new page')
check('page CSS still applies', (await frame.$eval('h1', (el) => getComputedStyle(el).fontSize)) === '52px')

await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(300)
check('undo restores the page', (await cardTitles()).length === 3)

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
