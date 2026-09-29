// Runs every browser check in order. Start the dev server first:
//   npx vite --port 5317
import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const dir = new URL('.', import.meta.url)
const specs = readdirSync(dir).filter((name) => name.endsWith('.mjs') && !['run.mjs', 'browser.mjs'].includes(name))
let failed = false
for (const spec of specs) {
  console.log(`\n▶ ${spec}`)
  const result = spawnSync(process.execPath, [new URL(spec, dir).pathname.replace(/^\/([A-Z]:)/, '$1')], { stdio: 'inherit' })
  if (result.status !== 0) failed = true
}
process.exit(failed ? 1 : 0)
