// Draws the guide's SVG pictures into public/guide/<topic id>.svg. Run: node scripts/guide-art/index.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { start, recipes } from './start.mjs'
import { tour, looks } from './tour.mjs'
import { website, access } from './website.mjs'
import { forms, dataArt, cardPopupArt } from './data.mjs'
import { interactive, code, help } from './more.mjs'
import { widgets } from './widgets.mjs'

const OUT = new URL('../../public/guide/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
mkdirSync(OUT, { recursive: true })
let count = 0
for (const set of [start, recipes, tour, looks, website, access, forms, dataArt, cardPopupArt, interactive, widgets, code, help]) {
  for (const [id, picture] of Object.entries(set)) {
    if (!picture) continue
    writeFileSync(`${OUT}art-${id}.svg`, picture)
    count += 1
  }
}
console.log(`${count} pictures written to public/guide/`)
