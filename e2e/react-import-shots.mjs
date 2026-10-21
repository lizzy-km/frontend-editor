// Screenshots of the progress screen while a React project opens (for looking at the design, not part of the checks).
import { join } from 'node:path'
import { OUT, openPage } from './browser.mjs'

const zip = join(OUT, 'ai-react-project.zip')
const { browser, page } = await openPage('/try')
await page.waitForTimeout(800)
await page.locator('input[aria-label="React project .zip"]').setInputFiles(zip)
await page.getByRole('button', { name: 'Open it as a Tweak site' }).click()
const card = page.locator('section[aria-label="Opening your project"]')
await card.waitFor()
let shot = 0
for (const wait of [1500, 6000, 7000]) {
  await page.waitForTimeout(wait)
  if (!(await card.count())) break
  await card.screenshot({ path: `${OUT}react-import-progress-${++shot}.png` })
}
await browser.close()
