// Settings panel: text size, color, spacing, arrange, hide on phone, advanced CSS.
import { check, OUT, openPage } from './browser.mjs'

const { browser, page, frame, box, errors } = await openPage('/try')
const css = (selector, prop) => frame.$eval(selector, (el, p) => getComputedStyle(el).getPropertyValue(p), prop)
const panel = page.locator('aside').last()
const selectAt = async (selector) => {
  const target = await box(selector)
  await page.mouse.move(target.x + 12, target.y + 12)
  await page.mouse.click(target.x + 12, target.y + 12)
  await page.waitForTimeout(400)
}

check('empty state shows tips', await panel.getByText('Click anything on your page').isVisible())

// Heading: text size + color
await selectAt('h1')
await page.screenshot({ path: OUT + 'inspector-heading.png' })
await panel.getByLabel('Text size value').fill('64')
await page.waitForTimeout(200)
check('text size changes', (await css('h1', 'font-size')) === '64px', await css('h1', 'font-size'))
await panel.getByLabel('Text color value').fill('#d9772b')
await panel.getByLabel('Text color value').press('Enter')
await page.waitForTimeout(200)
check('text color changes', (await css('h1', 'color')) === 'rgb(217, 119, 43)', await css('h1', 'color'))

// Card: space inside + rounded corners
await selectAt('.card:nth-child(2) h3')
await page.keyboard.press('Escape') // select parent = the card
await page.waitForTimeout(300)
await panel.getByLabel('Space inside value').fill('40')
await panel.getByLabel('Round corners value').fill('0')
await page.waitForTimeout(200)
check('padding on all sides', (await css('.card:nth-child(2)', 'padding')) === '40px', await css('.card:nth-child(2)', 'padding'))
check('corners squared', (await css('.card:nth-child(2)', 'border-radius')) === '0px')

// Cards container: stack them (1st Esc leaves the text box, 2nd selects the container)
await page.keyboard.press('Escape')
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await panel.getByRole('button', { name: 'Stacked' }).click()
await page.waitForTimeout(300)
check('cards stacked', (await css('.cards', 'flex-direction')) === 'column', await css('.cards', 'display'))

// Hide the picture on phones only
await page.getByRole('radio', { name: /phone/i }).click()
await page.waitForTimeout(600)
await selectAt('.hero img')
await panel.getByRole('switch', { name: 'Show on phones' }).click({ force: true })
await page.waitForTimeout(300)
check('picture hidden on phone', (await css('.hero img', 'display')) === 'none')
await page.getByRole('radio', { name: /computer/i }).click()
await page.waitForTimeout(600)
check('picture still visible on computer', (await css('.hero img', 'display')) !== 'none')
await page.screenshot({ path: OUT + 'inspector-desktop.png' })

// Undo walks back one step
await page.keyboard.press('Control+z')
await page.waitForTimeout(300)
check('undo works after panel edits', (await css('.hero img', 'display')) !== 'none')

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
