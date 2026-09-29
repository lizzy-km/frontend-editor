// Text editing (Quill) and quick actions (edit text, change picture).
import { check, openExample, OUT } from './browser.mjs'

const { browser, page, frame, box, errors } = await openExample()

// Double-click the heading, replace its text, Enter to finish
const h1 = await box('h1')
await page.mouse.move(h1.x + 30, h1.y + 30)
await page.waitForTimeout(100)
await page.mouse.dblclick(h1.x + 30, h1.y + 30)
await page.waitForSelector('.ql-editor', { timeout: 8000 })
await page.waitForTimeout(300)
await page.screenshot({ path: OUT + 'text-editing.png' })
await page.keyboard.press('Control+a')
await page.keyboard.type('Warm bread for everyone')
await page.keyboard.press('Enter')
await page.waitForTimeout(300)
check('heading text replaced', (await frame.$eval('h1', (el) => el.textContent)) === 'Warm bread for everyone')
check('Enter closes the editor', (await page.$('.ql-editor')) === null)

// Quick action "Edit text", bold the first word, click outside to save
const p = await box('.hero p')
await page.mouse.move(p.x + 20, p.y + 10)
await page.mouse.click(p.x + 20, p.y + 10)
await page.waitForTimeout(300)
await page.getByRole('toolbar', { name: 'Quick actions' }).getByRole('button', { name: 'Edit text' }).click()
await page.waitForSelector('.ql-editor')
await page.keyboard.press('Control+Home')
await page.keyboard.press('Shift+Control+ArrowRight')
await page.keyboard.press('Control+b')
await page.mouse.click(12, 845) // empty canvas area, outside the page
await page.waitForTimeout(300)
check('bold is saved', (await frame.$eval('.hero p', (el) => el.innerHTML)).includes('<strong'))

await page.keyboard.press('Control+z')
await page.waitForTimeout(200)
check('undo removes bold', !(await frame.$eval('.hero p', (el) => el.innerHTML)).includes('<strong'))

// Change picture
const img = await box('.hero img')
const newSrc = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=840'
await page.mouse.move(img.x + 50, img.y + 50)
await page.mouse.click(img.x + 50, img.y + 50)
await page.getByRole('toolbar', { name: 'Quick actions' }).getByRole('button', { name: 'Change picture' }).click()
await page.getByLabel('…or paste a picture address (link)').fill(newSrc)
await page.getByRole('button', { name: 'Use this picture' }).click()
await page.waitForTimeout(500)
check('picture replaced', (await frame.$eval('.hero img', (el) => el.getAttribute('src'))) === newSrc)

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
