// Regenerates the real-editor pictures used by the guide (public/guide/ui-*.png). Not a pass/fail check.
import { openExample, inspectorTab } from './browser.mjs'

const OUT_DIR = new URL('../public/guide/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const { browser, page, frame, box } = await openExample()
const shot = (name) => page.screenshot({ path: `${OUT_DIR}ui-${name}.png` })
const rail = (name) => page.locator('[aria-label="Project"]').getByRole('tab', { name }).click().then(() => page.waitForTimeout(300))

await rail('Add'); await shot('add')
await rail('Layers'); await shot('layers')
await rail('Design'); await shot('colors')
await rail('Code'); await shot('code')
await rail('Layers')
const h1 = await box('h1')
await page.mouse.click(h1.x + 20, h1.y + h1.height / 2)
await page.waitForTimeout(400)
await inspectorTab(page, 'Design'); await shot('settings')
await inspectorTab(page, 'Actions'); await shot('actions')
await browser.close()
