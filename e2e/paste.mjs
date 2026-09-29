// Paste flow: messy AI reply -> summary -> editor; draft survives a reload.
import { check, editorFrame, OUT, openPage } from './browser.mjs'

const AI_REPLY = `Sure! Here's a simple page for your yoga studio 🧘

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-emerald-50">
  <header class="p-8 text-center">
    <h1 class="text-5xl font-bold text-emerald-800">Calm <span class="text-emerald-500">Yoga</span></h1>
    <p class="mt-4 text-lg">Classes for every body.</p>
    <a href="#book" class="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white rounded-full">Book a class</a>
  </header>
  <script>document.querySelector('a').addEventListener('click', () => alert('Booked!'))</script>
</body>
</html>
\`\`\`

Let me know if you'd like changes!`

const { browser, page, errors } = await openPage('/try')

await page.getByLabel('Your code').fill('hello there, make me a website')
await page.waitForTimeout(300)
check('explains non-code text', await page.getByRole('alert').isVisible())

await page.getByLabel('Your code').fill(AI_REPLY)
await page.waitForTimeout(400)
const found = await page.getByText(/Found:/).textContent()
check('summary lists what was found', /Tailwind/.test(found) && /1 script/.test(found), found)
await page.screenshot({ path: OUT + 'paste-summary.png' })

await page.getByRole('button', { name: 'Open in editor' }).click()
const { frame } = await editorFrame(page)
await page.waitForTimeout(1500) // Tailwind CDN compiles classes
const color = await frame.$eval('h1', (el) => getComputedStyle(el).color)
check('Tailwind styles work while editing', color === 'rgb(6, 95, 70)', color)
check('page script did not run in the editor', errors.every((e) => !e.includes('Booked')))
await page.screenshot({ path: OUT + 'paste-editor.png' })

await page.reload()
await page.waitForTimeout(800)
check('draft offered after reload', await page.getByRole('button', { name: 'Continue my last page' }).isVisible())

check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
