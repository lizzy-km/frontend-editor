// One component, different data in each copy: copies show their own item of the data.
import { check, inspectorTab, openAddFolds, openExample } from './browser.mjs'

const { browser, page, box, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
const settings = page.locator('aside').last()
const pickCard = async (n) => {
  const h = await box(`.card:nth-child(${n}) h3`)
  await page.mouse.click(h.x + h.width / 2, h.y + h.height / 2)
  await page.waitForTimeout(300)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
}

await side.getByRole('tab', { name: 'Data' }).click()
await side.getByLabel('Start from').selectOption('Store products (Fake Store API)')
await side.getByRole('button', { name: 'Add data' }).click()
await page.waitForTimeout(300)
await side.getByRole('tab', { name: 'Layers' }).click()

// The first card becomes a component that shows one product
await pickCard(1)
await inspectorTab(page, 'Actions')
await settings.getByRole('button', { name: 'Component', exact: true }).click()
await settings.getByLabel('Component name').fill('Product card')
await settings.getByLabel('Component name').press('Enter')
await settings.getByRole('button', { name: 'Make a component' }).click()
await page.waitForTimeout(300)
await settings.getByRole('button', { name: 'Data', exact: true }).click()
await settings.getByLabel('Data to show').selectOption('storeProducts')
await page.waitForTimeout(300)
await settings.getByRole('button', { name: 'Fill in the fields for me' }).click()
await page.waitForTimeout(400)

await side.getByRole('tab', { name: 'Add' }).click()
await openAddFolds(page)
for (let i = 0; i < 2; i++) { await side.getByRole('button', { name: 'Product card' }).click(); await page.waitForTimeout(400) }

// Each copy picks its own item
for (const [card, item] of [[2, 3], [3, 4]]) {
  await pickCard(card)
  await inspectorTab(page, 'Actions')
  check(`copy ${card} is a copy`, (await settings.innerText()).includes('A copy of'))
  await settings.getByLabel('Which item').selectOption('number')
  await settings.getByLabel('Item number').first().fill(String(item))
  await page.waitForTimeout(300)
}

await page.getByRole('button', { name: 'Preview' }).click()
const view = page.frameLocator('iframe[title="Preview of your page"]')
await view.locator('.card').first().waitFor()
const titles = await view.locator('.card h3').allInnerTexts()
check('the copies show different products', titles[0].includes('Cotton Jacket') && titles[1].includes('Slim Fit'), titles.join(' | '))
check('the main component itself is not in the page (it would show the first product)', titles.length === 4 && !titles.some((text) => text.includes('Fjallraven')), String(titles.length))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
