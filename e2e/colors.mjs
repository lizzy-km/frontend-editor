// Colors tab: list the project's colors, change one everywhere (canvas follows), one undo step.
import { check, openExample } from './browser.mjs'

const { browser, page, frame, errors } = await openExample()
const sidebar = page.locator('aside').first()
await sidebar.getByRole('tab', { name: 'Colors' }).click()
await page.waitForTimeout(400)

const rows = sidebar.getByRole('list', { name: 'Colors on your page' }).getByRole('listitem')
check('colors found on the page', (await rows.count()) >= 3, String(await rows.count()))
const first = rows.first()
const hex = (await first.locator('input[maxlength="7"]').inputValue()).toLowerCase()
const rgb = `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`
const using = (color) => frame.evaluate((c) => [...document.querySelectorAll('body *')].filter((el) => {
  const s = getComputedStyle(el)
  return s.color === c || s.backgroundColor === c || s.borderTopColor === c
}).length, color)
const before = await using(rgb)
check('the most used color is really used in the canvas', before > 0, `${hex} used by ${before}`)

await first.locator('input[maxlength="7"]').fill('#0a7d3b')
await first.locator('input[maxlength="7"]').press('Enter')
await page.waitForTimeout(600)
check('canvas no longer uses the old color', (await using(rgb)) === 0, String(await using(rgb)))
check('canvas uses the new color where the old one was', (await using('rgb(10, 125, 59)')) >= before)
check('the list now shows the new color first', (await rows.first().locator('input[maxlength="7"]').inputValue()).toLowerCase() === '#0a7d3b')

await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(500)
check('undo restores it in one step', (await using(rgb)) === before)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
