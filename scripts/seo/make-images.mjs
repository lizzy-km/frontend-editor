// Draws the share picture (public/og-image.png, 1200 x 630), the app icons and favicon.svg.
// Run: node scripts/seo/make-images.mjs   (needs Chrome, like the e2e checks)
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const OUT = new URL('../../public/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
mkdirSync(OUT, { recursive: true })

const LOGO = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><rect width="32" height="32" rx="${radius}" fill="#e8573a"/><path d="M9.5 10.5h13M16 10.5v12" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`
writeFileSync(`${OUT}favicon.svg`, LOGO(32, 8))

const card = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff" stroke="#eadfd3" stroke-width="2" ${extra}/>`
const bar = (x, y, w, fill = '#e4ddd2', h = 12) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`

const OG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="Segoe UI, system-ui, sans-serif">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4ec"/><stop offset="1" stop-color="#fde3d6"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1080" cy="80" r="220" fill="#e8573a" opacity=".08"/>
  <g transform="translate(70 66) scale(2.5)"><rect width="32" height="32" rx="8" fill="#e8573a"/><path d="M9.5 10.5h13M16 10.5v12" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  <text x="170" y="122" font-size="44" font-weight="800" fill="#2b2620">Tweak</text>
  <text x="70" y="276" font-size="62" font-weight="850" fill="#2b2620" letter-spacing="-1.5">Build a real website</text>
  <text x="70" y="350" font-size="62" font-weight="850" fill="#e8573a" letter-spacing="-1.5">just by clicking.</text>
  <text x="70" y="430" font-size="32" fill="#6b6359">Paste your AI’s page, click to change it,</text>
  <text x="70" y="474" font-size="32" fill="#6b6359">then share it or download a React project.</text>
  <g transform="translate(70 520)">
    ${['Pages', 'Forms', 'Data', 'Sign-in'].map((label, i) => `<rect x="${i * 150}" y="0" width="134" height="52" rx="26" fill="#fff" stroke="#eadfd3" stroke-width="2"/><text x="${i * 150 + 67}" y="34" font-size="24" font-weight="700" fill="#2b2620" text-anchor="middle">${label}</text>`).join('')}
  </g>
  <g transform="translate(720 90)">
    ${card(0, 0, 420, 450)}
    <rect x="0" y="0" width="420" height="46" rx="18" fill="#efe7dc"/><circle cx="26" cy="23" r="6" fill="#e8573a"/><circle cx="46" cy="23" r="6" fill="#d8d0c4"/><circle cx="66" cy="23" r="6" fill="#d8d0c4"/>
    ${bar(34, 90, 220, '#2b2620', 18)}${bar(34, 128, 330)}${bar(34, 154, 270)}
    <rect x="34" y="196" width="150" height="46" rx="23" fill="#e8573a"/>
    <rect x="26" y="78" width="248" height="42" rx="8" fill="none" stroke="#e8573a" stroke-width="3" stroke-dasharray="8 6"/>
    <rect x="34" y="276" width="170" height="130" rx="14" fill="#efe7dc"/><rect x="216" y="276" width="170" height="130" rx="14" fill="#efe7dc"/>
    <circle cx="274" cy="116" r="0" fill="#e8573a"/>
  </g>
</svg>`

const browser = await chromium.launch({ executablePath: CHROME })
async function shot(svg, width, height, file) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.setContent(`<body style="margin:0">${svg}</body>`)
  await page.screenshot({ path: `${OUT}${file}`, clip: { x: 0, y: 0, width, height } })
  await page.close()
}
await shot(OG, 1200, 630, 'og-image.png')
await shot(LOGO(512, 6), 512, 512, 'icon-512.png')
await shot(LOGO(192, 6), 192, 192, 'icon-192.png')
await shot(LOGO(180, 0).replace('rx="0"', 'rx="0"'), 180, 180, 'apple-touch-icon.png')
await browser.close()

writeFileSync(`${OUT}site.webmanifest`, JSON.stringify({
  name: 'Tweak — build websites by clicking', short_name: 'Tweak', start_url: '/', display: 'standalone',
  background_color: '#faf7f2', theme_color: '#e8573a',
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
}, null, 2) + '\n')
console.log('Wrote og-image.png, icons, favicon.svg and site.webmanifest to public/')
