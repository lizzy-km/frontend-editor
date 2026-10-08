// Every code box is CodeMirror: the paste screen (one piece or HTML/CSS/JS), and "Paste more code" in Add.
import { check, editorFrame, OUT, openPage } from './browser.mjs'

const { browser, page, errors } = await openPage('/try')
const pasteBox = page.locator('.cm-editor', { has: page.getByLabel('Your code') })
await pasteBox.waitFor({ timeout: 10000 })
check('paste box is a code editor with line numbers', (await pasteBox.locator('.cm-lineNumbers').count()) === 1)
check('paste box shows its hint', (await pasteBox.locator('.cm-placeholder').textContent()).includes('Paste here'))

// Dropping an .html file reads it into the box
await pasteBox.locator('.cm-content').evaluate((element) => {
  const data = new DataTransfer()
  data.items.add(new File(['<h1>Dropped page</h1>'], 'page.html', { type: 'text/html' }))
  element.dispatchEvent(new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }))
})
await page.waitForTimeout(400)
check('a dropped .html file fills the box', (await pasteBox.locator('.cm-content').textContent()).includes('<h1>Dropped page</h1>'))

await page.getByRole('button', { name: /separate parts/ }).click()
for (const label of ['CSS (styles)', 'JavaScript']) {
  const box = page.locator('.cm-editor', { has: page.getByLabel(label) })
  await box.waitFor({ timeout: 5000 })
  check(`${label} box is a code editor`, (await box.count()) === 1)
}
await page.screenshot({ path: OUT + 'code-editors-paste.png' })

// Add panel
await page.getByRole('button', { name: /one piece/ }).click()
await page.getByRole('button', { name: 'Open in editor' }).click()
await editorFrame(page)
await page.getByRole('tab', { name: 'Add' }).click()
const addBox = page.locator('.cm-editor', { has: page.getByLabel('Paste more code') })
await addBox.waitFor({ timeout: 10000 })
await addBox.locator('.cm-content').click()
await page.keyboard.type('<p class="added">Fresh section</p>')
await page.getByRole('button', { name: 'Add this code' }).click()
await page.waitForTimeout(400)
const { frame } = await editorFrame(page)
check('"Paste more code" is a code editor and adds the code', (await frame.$$('.added')).length === 1)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
