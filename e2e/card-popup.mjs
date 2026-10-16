// A data card opens a pop-up that shows ITS item; a link in the pop-up carries the item's address.
import { check, inspectorTab, openAddFolds, openExample } from './browser.mjs'

const { browser, page, errors } = await openExample()
await page.waitForTimeout(800)
const side = page.locator('aside').first()
const settings = page.locator('aside').last()
await side.getByRole('tab', { name: 'Data' }).click()
await side.getByLabel('Start from').selectOption('Store products (Fake Store API)')
await side.getByRole('button', { name: 'Add data' }).click()
await page.waitForTimeout(300)
await side.getByRole('tab', { name: 'Add' }).click()
await openAddFolds(page)
const add = async (name) => {
  await page.evaluate(() => document.activeElement?.blur())
  for (let i = 0; i < 3; i++) await page.keyboard.press('Escape')
  await side.getByRole('button', { name, exact: true }).click()
  await page.waitForTimeout(400)
}
await add('List from data')
await inspectorTab(page, 'Actions')
const options = await settings.getByLabel('What clicking a card does').locator('option').allInnerTexts()
check('"Open a pop-up" is offered (add one first when there is none)', options.some((text) => text.includes('Open a pop-up (add one first)')), options.join(' | '))
await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
await add('Pop-up')

// Choose the list again and make its cards open the pop-up
await side.getByRole('tab', { name: 'Layers' }).click()
await side.getByRole('treeitem').filter({ hasText: /^List from data/ }).first().click()
await inspectorTab(page, 'Actions')
await settings.getByLabel('What clicking a card does').selectOption('popup')
await page.waitForTimeout(400)
check('the card now opens the pop-up', (await settings.getByLabel('Pop-up a card opens').inputValue()).length > 0)

// The pop-up shows "the one that was clicked": connect its words to the item
await side.getByRole('tab', { name: 'Layers' }).click()
await side.getByRole('treeitem').filter({ hasText: /^Data box/ }).first().click() // the pop-up, now a data box
await inspectorTab(page, 'Actions')
await page.waitForTimeout(200)
check('the pop-up is set to show the card that opened it', (await settings.getByLabel('Which item').inputValue()) === 'clicked')
await settings.getByRole('button', { name: 'Fill in the fields for me' }).click()
await page.waitForTimeout(400)

await page.getByRole('button', { name: 'Preview' }).click()
const view = page.frameLocator('iframe[title="Preview of your page"]')
await view.locator('article.data-card').first().waitFor()
const cards = view.locator('article.data-card')
await cards.nth(2).click()
await page.waitForTimeout(400)
const heading = view.locator('[role="dialog"] h2')
check('clicking card 3 opens the pop-up with card 3’s item', (await heading.innerText()).includes('Mens Cotton Jacket'), await heading.innerText().catch(() => ''))
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await cards.nth(0).click()
await page.waitForTimeout(400)
check('card 1 shows its own item', (await view.locator('[role="dialog"] h2').innerText()).includes('Fjallraven'))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
