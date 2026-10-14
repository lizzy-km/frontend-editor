// Data: Import from JSON in "Edit fields and rows": preview, errors, replace and add.
import { check, openExample } from './browser.mjs'

const { browser, page, errors } = await openExample()
const sidebar = page.locator('aside').first()
await sidebar.getByRole('tab', { name: 'Data' }).click()
await sidebar.getByLabel('Start from').selectOption('Products')
await sidebar.getByRole('button', { name: 'Add data' }).click()
await sidebar.getByRole('button', { name: 'Edit fields and rows' }).click()
const dialog = page.getByRole('dialog')
await dialog.getByRole('button', { name: 'Import from JSON' }).click()

const paste = async (value) => {
  const box = dialog.locator('.cm-editor', { has: page.getByLabel('JSON to import') }).locator('.cm-content')
  await box.waitFor({ timeout: 10000 })
  await box.evaluate((element, text) => {
    const data = new DataTransfer()
    data.setData('text/plain', text)
    element.focus()
    document.execCommand('selectAll')
    element.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }))
  }, value)
  await page.waitForTimeout(400)
}

await paste('[{ "title": "Backpack", oops')
check('bad JSON is explained', (await dialog.getByRole('alert').innerText()).includes('not valid JSON'))
check('nothing can be imported yet', await dialog.getByRole('button', { name: 'Replace everything' }).isDisabled())

const store = [
  { id: 1, title: 'Backpack', price: 109.95, category: "men's clothing", image: 'https://fakestoreapi.com/img/81fPKd.jpg', rating: { rate: 3.9, count: 120 } },
  { id: 2, title: 'T-Shirt', price: 22.3, category: "men's clothing", image: 'https://fakestoreapi.com/img/71-3Hj.jpg', rating: { rate: 4.1, count: 259 } },
]
await paste(JSON.stringify({ status: 'ok', data: { items: store } }))
const found = await dialog.getByRole('status').innerText()
check('preview: items and fields found inside the answer', found.includes('Found 2 items') && found.includes('ratingRate (number)') && found.includes('image (picture)'), found)

await dialog.getByRole('button', { name: 'Add to the rows I have' }).click()
await page.waitForTimeout(400)
check('rows added to the existing ones', (await dialog.locator('tbody tr').count()) === 8)
check('new fields became columns', (await dialog.locator('th').allTextContents()).includes('ratingCount'))

await dialog.getByRole('button', { name: 'Import from JSON' }).click()
await paste(JSON.stringify(store))
await dialog.getByRole('button', { name: 'Replace everything' }).click()
await page.waitForTimeout(400)
check('replace keeps only the imported rows', (await dialog.locator('tbody tr').count()) === 2)
check('old fields are gone', !(await dialog.locator('th').allTextContents()).includes('inStock'))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
