// Canvas: select, drag to reorder, undo, resize, phone view.
import { check, OUT, openPage } from './browser.mjs'

const { browser, page, frame, box, errors } = await openPage('/try')
const cardTitles = () => frame.$$eval('.card h3', (els) => els.map((el) => el.textContent))

// Select the heading
const h1 = await box('h1')
await page.mouse.move(h1.x + 20, h1.y + 10)
await page.mouse.click(h1.x + 20, h1.y + 10)
await page.waitForTimeout(300)
await page.screenshot({ path: OUT + 'canvas-selected.png' })

// Drag the 3rd card onto the left half of the 1st card -> becomes first
const c3 = await box('.card:nth-child(3)')
const c1 = await box('.card:nth-child(1)')
await page.mouse.move(c3.x + 10, c3.y + c3.height - 10)
await page.waitForTimeout(150)
await page.mouse.down()
await page.mouse.move(c3.x - 50, c3.y + 20, { steps: 8 })
await page.mouse.move(c1.x + 8, c1.y + c1.height / 2, { steps: 8 })
await page.waitForTimeout(200)
await page.screenshot({ path: OUT + 'canvas-dragging.png' })
await page.mouse.up()
await page.waitForTimeout(300)
check('drag reorders cards', (await cardTitles())[0] === 'Cinnamon rolls', (await cardTitles()).join(', '))

await page.keyboard.press('Control+z')
await page.waitForTimeout(200)
check('undo restores order', (await cardTitles())[0] === 'Sourdough')

// Resize the button with the right-middle handle
const btn = await box('.btn')
await page.mouse.click(btn.x + 10, btn.y + 10)
await page.waitForTimeout(300)
await page.mouse.move(btn.x + btn.width, btn.y + btn.height / 2)
await page.mouse.down()
await page.mouse.move(btn.x + btn.width + 60, btn.y + btn.height / 2, { steps: 6 })
await page.mouse.up()
await page.waitForTimeout(300)
const newWidth = (await box('.btn')).width
check('resize handle widens the button', newWidth > btn.width + 40, `${Math.round(btn.width)} -> ${Math.round(newWidth)}`)

await page.getByRole('radio', { name: /phone/i }).click()
await page.waitForTimeout(800)
await page.screenshot({ path: OUT + 'canvas-phone.png' })

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
