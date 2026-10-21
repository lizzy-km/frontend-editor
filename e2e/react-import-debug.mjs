// Debug helper: runs the React import and prints what the page says every few seconds (not part of the checks).
import { join } from 'node:path'
import { OUT, openPage } from './browser.mjs'

const zip = join(OUT, 'ai-react-project.zip')
const { browser, page, errors } = await openPage('/try')
page.on('console', (message) => console.log('  [console]', message.type(), message.text().slice(0, 300)))
await page.waitForTimeout(800)
await page.locator('input[aria-label="React project .zip"]').setInputFiles(zip)
await page.getByRole('button', { name: 'Open it as a Tweak site' }).click()
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(3000)
  const text = await page.locator('[role=status], [role=alert]').allInnerTexts()
  console.log(`  t=${(i + 1) * 3}s`, JSON.stringify(text).slice(0, 400))
  if (text.some((item) => /^Found [0-9]|could not|too long|Could not/.test(item))) break
}
console.log('errors', errors.slice(0, 5))
await browser.close()
