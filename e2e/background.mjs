// Background section: picture and gradient in their own tabs, both can be used together.
import { check, openExample, OUT } from './browser.mjs'

const DOT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
const { browser, page, frame, box, errors } = await openExample()
const panel = page.locator('aside').last()
const bg = (selector, prop = 'background-image') => frame.$eval(selector, (el, name) => getComputedStyle(el).getPropertyValue(name), prop)
// With a gradient and a picture the browser lists sizes/positions once per layer: the picture is the last one.
const lastLayer = async (selector, prop) => (await bg(selector, prop)).split(',').at(-1).trim()

const select = async (selector) => {
  await page.mouse.click(12, 845)
  const target = await box(selector)
  await page.mouse.move(target.x + 8, target.y + 8)
  await page.mouse.click(target.x + 8, target.y + 8)
  await page.waitForTimeout(400)
}

await select('.hero')
check('tabs for picture and gradient', (await panel.getByRole('tab', { name: 'Picture' }).count()) === 1 && (await panel.getByRole('tab', { name: 'Gradient' }).count()) === 1)

// Gradient: preset, type, extra color
await panel.getByRole('tab', { name: 'Gradient' }).click()
await panel.getByRole('listitem', { name: 'Sunset' }).click()
await page.waitForTimeout(300)
check('preset applies a gradient', (await bg('.hero')).startsWith('linear-gradient(135deg'), await bg('.hero'))
await panel.getByRole('group', { name: 'Gradient type' }).getByRole('button', { name: 'Round' }).click()
await panel.getByRole('button', { name: 'Add color' }).click()
await page.waitForTimeout(300)
const round = await bg('.hero')
check('round gradient with 3 colors', round.startsWith('radial-gradient(') && (round.match(/rgb/g) ?? []).length === 3, round)

// Picture under the gradient
await panel.getByRole('tab', { name: 'Picture' }).click()
await panel.getByRole('button', { name: 'Choose picture' }).click()
await page.getByLabel('…or paste a picture address (link)').fill(DOT)
await page.getByRole('button', { name: 'Use this picture' }).click()
await page.waitForTimeout(300)
const both = await bg('.hero')
check('gradient drawn over the picture', both.startsWith('radial-gradient') && both.includes('url("data:image/png'), both.slice(0, 80))
check('a new picture fills the box once', (await lastLayer('.hero', 'background-size')) === 'cover' && (await lastLayer('.hero', 'background-repeat')) === 'no-repeat')
await panel.getByLabel('Picture fit').selectOption('contain')
await panel.getByRole('radiogroup', { name: 'Picture position' }).getByRole('radio', { name: 'Top left' }).click()
await page.waitForTimeout(300)
check('fit and position change', (await lastLayer('.hero', 'background-size')) === 'contain' && (await lastLayer('.hero', 'background-position')) === '0% 0%')
await page.screenshot({ path: OUT + 'background-picture.png' })

// Remove the gradient, keep the picture; undo brings it back
await panel.getByRole('tab', { name: 'Gradient' }).click()
await panel.getByRole('button', { name: 'Remove gradient' }).click()
await page.waitForTimeout(300)
check('removing the gradient keeps the picture', (await bg('.hero')).startsWith('url('), (await bg('.hero')).slice(0, 40))
await page.keyboard.press('Control+z')
await page.waitForTimeout(300)
check('undo brings the gradient back', (await bg('.hero')).startsWith('radial-gradient'))

// Gradient text on a heading
await select('.hero h1')
await panel.getByRole('tab', { name: 'Gradient' }).click()
await panel.getByRole('listitem', { name: 'Ocean' }).click()
await panel.getByText('Use on the text instead').click()
await page.waitForTimeout(300)
check('gradient on the text', (await bg('.hero h1', '-webkit-text-fill-color')) === 'rgba(0, 0, 0, 0)' && (await bg('.hero h1', 'background-clip')) === 'text')
await page.screenshot({ path: OUT + 'background-gradient-text.png' })

check('See-through moved to the effects section', (await panel.getByText('See-through', { exact: true }).count()) === 1)
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
