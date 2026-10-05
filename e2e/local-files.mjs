// A page copied from a dev server links files that weren't pasted (/@vite/client, /src/main.tsx).
// They must not be fetched from Tweak's own server (editor frame or Preview), and the paste screen says so.
import { check, editorFrame, openPage } from './browser.mjs'

const PAGE = `<!doctype html><html><head><title>Copied</title>
<script type="module" src="/@vite/client"></script>
<link rel="stylesheet" href="css/site.css">
</head><body><h1>Copied page</h1><div id="root"></div>
<script type="module" src="/src/main.tsx"></script></body></html>`

const { browser, page, errors } = await openPage('/try')
const asked = []
page.on('request', (request) => {
  const path = new URL(request.url()).pathname
  if (['/@vite/client', '/src/main.tsx', '/css/site.css'].includes(path) && request.frame() !== page.mainFrame()) asked.push(path)
})

await page.getByLabel('Your code').fill(PAGE)
await page.waitForTimeout(500)
const note = page.getByText(/files that you didn’t paste/)
check('paste screen names the missing files', (await note.textContent()).includes('/src/main.tsx'))

await page.getByRole('button', { name: 'Open in editor' }).click()
const { frame } = await editorFrame(page)
check('page still opens', (await frame.$eval('h1', (el) => el.textContent)) === 'Copied page')
await page.getByRole('button', { name: 'Preview' }).click()
await page.waitForTimeout(1200)
check("editor and Preview don't fetch the missing files from Tweak's server", asked.length === 0, asked.join(', '))
check('no console errors', errors.length === 0, errors.join(' | '))
await browser.close()
