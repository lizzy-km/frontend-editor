// Draws docs/diagrams/*.mmd (Mermaid) into .svg and .png next to them.
// Run: node scripts/diagrams/render.mjs   (needs Chrome and internet for the Mermaid script, like the e2e checks need Chrome)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const DIR = new URL('../../docs/diagrams/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const MERMAID = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js'

const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 })
await page.setContent('<body style="margin:0;background:#fff"><div id="out"></div></body>')
await page.addScriptTag({ url: MERMAID })
await page.evaluate(() => window.mermaid.initialize({
  startOnLoad: false, theme: 'base', securityLevel: 'loose',
  flowchart: { htmlLabels: true, curve: 'basis', padding: 14, nodeSpacing: 36, rankSpacing: 52, subGraphTitleMargin: { top: 18, bottom: 18 } },
  sequence: { useMaxWidth: false, mirrorActors: false, wrap: false, width: 230, actorMargin: 150, messageMargin: 46, noteMargin: 16, boxMargin: 14, messageAlign: 'center', showSequenceNumbers: false },
  themeVariables: {
    fontFamily: 'Segoe UI, system-ui, sans-serif', fontSize: '15px',
    primaryColor: '#fff4ec', primaryBorderColor: '#e8573a', primaryTextColor: '#2b2620',
    secondaryColor: '#e1eafa', tertiaryColor: '#faf7f2', lineColor: '#6b6359',
    clusterBkg: '#faf7f2', clusterBorder: '#d8d0c4', noteBkgColor: '#fff4ec', noteBorderColor: '#e8573a',
    actorBkg: '#fff4ec', actorBorder: '#e8573a', signalColor: '#6b6359',
  },
}))

for (const file of readdirSync(DIR).filter((name) => name.endsWith('.mmd')).sort()) {
  const name = file.replace(/\.mmd$/, '')
  const source = readFileSync(DIR + file, 'utf8')
  const svg = await page.evaluate(async ([id, code]) => {
    const { svg } = await window.mermaid.render(`d-${id}`, code)
    document.getElementById('out').innerHTML = svg
    return svg
  }, [name.replace(/\W/g, ''), source])
  writeFileSync(`${DIR}${name}.svg`, svg)
  const box = await page.locator('#out svg').boundingBox()
  await page.setViewportSize({ width: Math.ceil(box.width) + 40, height: Math.ceil(box.height) + 40 })
  await page.locator('#out svg').screenshot({ path: `${DIR}${name}.png` })
  console.log(`${name}: ${Math.round(box.width)} x ${Math.round(box.height)}`)
}
await browser.close()
