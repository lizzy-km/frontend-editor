// Add → Paste more code takes HTML, CSS and JavaScript (together, or any one of them).
import { check, editorFrame, openExample } from './browser.mjs'

const { browser, page, errors } = await openExample()
const fresh = async () => (await editorFrame(page)).frame // the frame is rebuilt when a script is added
await page.waitForTimeout(800)
const side = page.locator('aside').first()
await page.locator('[aria-label="Project"]').getByRole('tab', { name: 'Add' }).click()
const type = async (label, text) => {
  const editor = side.getByLabel(label)
  await editor.click()
  await page.keyboard.insertText(text)
}
const tab = (name) => side.getByRole('tab', { name, exact: false }).filter({ hasText: name }).first().click().then(() => page.waitForTimeout(300))
const add = () => side.getByRole('button', { name: 'Add this code' }).click().then(() => page.waitForTimeout(500))

// 1) HTML + CSS + JavaScript in their own boxes
await type('Paste HTML', '<section class="promo"><h2 id="promo-title">Promo</h2></section>')
await tab('CSS'); await type('Paste CSS', '.promo { background: rgb(255, 0, 0); padding: 24px }')
await tab('JavaScript'); await type('Paste JavaScript', "document.getElementById('promo-title').textContent = 'Promo (script ran)'")
check('the tabs show which boxes have code', (await side.getByRole('tab', { name: /HTML/ }).innerText()).includes('•'))
await add()
let frame = await fresh()
check('the HTML is on the page', (await frame.$$('.promo')).length === 1)
check('the CSS is applied', (await frame.$eval('.promo', (el) => getComputedStyle(el).backgroundColor)) === 'rgb(255, 0, 0)')
check('the JavaScript ran', (await frame.$eval('#promo-title', (el) => el.textContent)).includes('script ran'))

// 2) CSS alone
await tab('HTML')
await tab('CSS'); await type('Paste CSS', '.promo h2 { color: rgb(0, 0, 255) }')
await add()
frame = await fresh()
check('CSS on its own is added', (await frame.$eval('.promo h2', (el) => getComputedStyle(el).color)) === 'rgb(0, 0, 255)')

// 3) A whole snippet with its own <style> inside the HTML box
await tab('HTML'); await type('Paste HTML', '<p class="note">Note</p><style>.note { font-size: 31px }</style>')
await add()
frame = await fresh()
check('a <style> inside the HTML is merged too', (await frame.$eval('.note', (el) => getComputedStyle(el).fontSize)) === '31px')

// 4) Something that is not HTML is explained
await type('Paste HTML', 'just some words')
await add()
check('words that are not code are explained', await page.getByText('doesn’t look like web page code').isVisible())
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
