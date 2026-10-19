// Showcase examples: each opens from the paste screen, shows in the editor, and works for visitors in Preview.
import { check, OUT, openPage } from './browser.mjs'

const IDS = ['shop', 'cafe', 'agency', 'members']

/** Opens one example from the start screen and returns the page, the editor frame and the console errors. */
async function openExample(id) {
  const { browser, page, errors } = await openPage('/try')
  await page.waitForTimeout(800)
  await page.getByText('No idea yet? Start from a finished example').click()
  await page.locator(`[data-showcase="${id}"]`).getByRole('button', { name: 'Open this example' }).click()
  await page.waitForSelector('iframe[title="Your page"]')
  await page.waitForTimeout(2500)
  return { browser, page, errors }
}

for (const id of IDS) {
  const { browser, page, errors } = await openExample(id)
  const frame = page.frames().find((item) => item !== page.mainFrame())
  check(`${id}: opens in the editor`, (await frame.$$('[data-fe-id]')).length > 40)
  check(`${id}: has a shared top bar and a footer`, (await frame.$$('[data-fe-layout="top"]')).length === 1 && (await frame.$$('footer')).length >= 1)
  await page.screenshot({ path: `${OUT}showcase-${id}-editor.png` })

  await page.getByRole('button', { name: 'Preview' }).click()
  await page.waitForTimeout(2500)
  const preview = page.frameLocator('iframe[title="Preview of your page"]')
  check(`${id}: Preview shows the home page`, (await preview.locator('h1').first().innerText()).length > 3)
  const broken = await preview.locator('img').evaluateAll((all) => all.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src))
  check(`${id}: no broken pictures on the home page`, broken.length === 0, broken.slice(0, 3).join(' '))
  await page.screenshot({ path: `${OUT}showcase-${id}-preview.png` })
  const real = errors.filter((message) => !/Failed to load resource|favicon|firestore|identitytoolkit|googleapis/i.test(message))
  check(`${id}: no console errors`, real.length === 0, real.join(' | '))
  await browser.close()
}
