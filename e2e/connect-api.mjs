// Connect your API: test connection (errors in plain words), a key, the items and fields found, "Use these".
import { check, openExample } from './browser.mjs'

const { browser, page, errors } = await openExample()
const sidebar = page.locator('aside').first()
const requests = []
await page.route('https://api.example.test/**', async (route) => {
  const request = route.request()
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
  requests.push({ url: request.url(), auth: request.headers()['authorization'] })
  if (request.url().includes('/private') && request.headers()['authorization'] !== 'Bearer letmein') return route.fulfill({ status: 401, headers: cors, body: '{}' })
  if (request.url().includes('/html')) return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'text/html' }, body: '<html>hi</html>' })
  route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ meta: {}, data: { items: [
    { id: 1, title: 'Alpha', price: 10, image: 'https://img.test/a.jpg', rating: { rate: 4.5 } }, { id: 2, title: 'Beta', price: 20, image: 'https://img.test/b.jpg', rating: { rate: 3 } } ] } }) })
})

await sidebar.getByRole('tab', { name: 'Data' }).click()
await sidebar.getByLabel('Start from').selectOption('Products')
await sidebar.getByRole('button', { name: 'Add data' }).click()
check('the data starts on sample items', await sidebar.getByText('Using sample items').isVisible())
await sidebar.getByRole('button', { name: 'Connect your API' }).click()
const dialog = page.getByRole('dialog')

await dialog.getByLabel('Address').fill('api.example.test/items')
await dialog.getByRole('button', { name: 'Test connection' }).click()
check('an address without https is explained', (await dialog.getByRole('alert').innerText()).includes('https://'))

await dialog.getByLabel('Address').fill('https://api.example.test/private/items')
await dialog.getByRole('button', { name: 'Test connection' }).click()
await page.waitForTimeout(700)
check('401 says to check the key', (await dialog.getByRole('alert').innerText()).includes('not allowed'))
check('Use is off until it works', await dialog.getByRole('button', { name: /^Use these/ }).isDisabled())

await dialog.getByRole('switch', { name: 'This API needs a key' }).click({ force: true })
await dialog.getByLabel('Your key (only for this test)').fill('letmein')
await dialog.getByRole('button', { name: 'Test connection' }).click()
await page.waitForTimeout(800)
const found = await dialog.getByRole('status').innerText()
check('it connects with the key and finds the items inside the answer', found.includes('Found 2 items') && found.includes('data.items'), found.slice(0, 80))
check('nested fields are listed with their own names', found.includes('ratingRate (number)'))
check('the key was sent as a Bearer header', requests.some((r) => r.auth === 'Bearer letmein'))
check('visitors are warned about keys in websites', await dialog.getByText(/Visitors can still see it/).isVisible())

await dialog.getByRole('button', { name: 'Use these 2 items' }).click()
await page.waitForTimeout(500)
check('the source shows it is connected, with the key setting', (await sidebar.getByText(/Connected to/).innerText()).includes('api.example.test') && (await sidebar.getByText(/Connected to/).innerText()).includes('VITE_API_KEY'))
await sidebar.getByRole('button', { name: 'Edit fields and rows' }).click()
const table = page.getByRole('dialog')
check('the sample items were replaced by the real ones', (await table.locator('tbody tr').count()) === 2 && (await table.locator('th').allTextContents()).includes('ratingRate'))
await table.getByRole('button', { name: 'Done' }).click()

await page.mouse.click(12, 845)
await page.keyboard.press('Control+z')
await page.waitForTimeout(400)
check('undo takes the connection back in one step', await sidebar.getByText('Using sample items').isVisible())
const unexpected = errors.filter((text) => !text.includes('401')) // the deliberate wrong-key test
check('no console errors', unexpected.length === 0, unexpected.join(' | '))
await browser.close()
