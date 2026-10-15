// Connect your API: an address for ONE item with :id (tested with an id), and :id typed in the list address gets moved.
import { check, openExample } from './browser.mjs'

const { browser, page, errors } = await openExample()
const sidebar = page.locator('aside').first()
const calls = []
await page.route('https://api.example.test/**', async (route) => {
  const url = route.request().url()
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
  if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
  calls.push(url.replace('https://api.example.test', ''))
  const one = url.match(/\/items\/(\d+)$/)
  if (one && one[1] === '404') return route.fulfill({ status: 404, headers: cors, body: '{}' })
  const body = one
    ? { data: { id: Number(one[1]), title: `Item ${one[1]}`, price: 5 } }
    : { data: { items: [{ id: 3, title: 'Three', price: 3, rating: { rate: 4 } }, { id: 4, title: 'Four', price: 4, rating: { rate: 5 } }] } }
  route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(body) })
})

await sidebar.getByRole('tab', { name: 'Data' }).click()
await sidebar.getByLabel('Start from').selectOption('Products')
await sidebar.getByRole('button', { name: 'Add data' }).click()
await sidebar.getByRole('button', { name: 'Connect your API' }).click()
const dialog = page.getByRole('dialog')

// :id typed in the list address is not a list: offer to move it
await dialog.getByLabel('Address for the list').fill('https://api.example.test/items/:id')
check('an address with :id is recognised as a one-item address', await dialog.getByText('has a changing part').isVisible())
check('and the test is off until it is moved', await dialog.getByRole('button', { name: 'Test connection' }).isDisabled())
await dialog.getByRole('button', { name: 'Use it as the address for one item' }).click()
check('it moved to the one-item address', (await dialog.getByLabel('Address for one item (optional)').inputValue()) === 'https://api.example.test/items/:id' && (await dialog.getByLabel('Address for the list').inputValue()) === '')

await dialog.getByLabel('Address for the list').fill('https://api.example.test/items')
await dialog.getByLabel('Try the one-item address with id').fill('404')
await dialog.getByRole('button', { name: 'Test connection' }).click()
await page.waitForTimeout(900)
check('a missing item is explained with its id', (await dialog.getByRole('alert').innerText()).includes('One item (id 404)'))

await dialog.getByLabel('Try the one-item address with id').fill('')
await dialog.getByRole('button', { name: 'Test connection' }).click()
await page.waitForTimeout(900)
check('the list is found', (await dialog.getByRole('status').first().innerText()).includes('Found 2 items'))
const one = await dialog.getByRole('status', { name: 'One item test' }).innerText()
check('the one-item address works, tried with the first item\'s id', one.includes('One item works') && one.includes('Item 3 came back') && one.includes('inside “data”'), one)
check('and it says which fields a detail page will lack', one.includes('ratingRate'), one)
check('the one-item call used the id', calls.includes('/items/3'))

await dialog.getByRole('button', { name: 'Use these 2 items' }).click()
await page.waitForTimeout(500)
check('the source says detail pages ask for one item', await sidebar.getByText('Detail pages ask for one item at a time').isVisible())

await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(400)
check('undo removes the connection in one step', await sidebar.getByText('Using sample items').isVisible())
const unexpected = errors.filter((text) => !text.includes('404'))
check('no console errors', unexpected.length === 0, unexpected.join(' | '))
await browser.close()
