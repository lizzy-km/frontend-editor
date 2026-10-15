// Tiny drawing helpers for the guide's SVG pictures (run: node scripts/guide-art/index.mjs).
export const C = { bg: '#faf7f2', card: '#fff', line: '#e4ddd2', soft: '#ece6db', mid: '#d8d0c4', ink: '#2b2620', mute: '#6b6359', hot: '#e8573a', hotSoft: '#fbe0d9', ok: '#3f9d6b', okSoft: '#dff0e6', blue: '#4a7bd0', blueSoft: '#e1eafa' }
const attrs = (o) => Object.entries(o).map(([k, v]) => ` ${k}="${v}"`).join('')
export const svg = (w, h, label, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="system-ui,Segoe UI,sans-serif" role="img" aria-label="${label}"><rect width="${w}" height="${h}" rx="18" fill="${C.bg}"/>${body}</svg>\n`
export const r = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 8}" fill="${o.fill ?? C.card}" stroke="${o.stroke ?? 'none'}" stroke-width="${o.sw ?? 1.5}"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`
export const card = (x, y, w, h, o = {}) => r(x, y, w, h, { stroke: C.line, rx: 12, ...o })
export const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size ?? 14}" font-weight="${o.weight ?? 600}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? 'start'}">${s}</text>`
export const bar = (x, y, w, fill = C.mid, h = 8) => r(x, y, w, h, { rx: h / 2, fill })
export const bars = (x, y, widths, gap = 14) => widths.map((w, i) => bar(x, y + i * gap, w)).join('')
export const btn = (x, y, w, label, o = {}) => r(x, y, w, 30, { rx: 15, fill: o.fill ?? C.hot }) + t(x + w / 2, y + 20, label, { size: 13, weight: 700, fill: o.color ?? '#fff', anchor: 'middle' })
export const pic = (x, y, w, h) => r(x, y, w, h, { fill: C.soft }) + `<path d="M${x + w * .15} ${y + h * .8} l${w * .25} ${-h * .35} l${w * .2} ${h * .25} l${w * .15} ${-h * .15} l${w * .25} ${h * .25}z" fill="${C.mid}"/>`
export const arrow = (x1, y1, x2, y2, col = C.hot) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9
  const p = (d) => `${x2 - s * Math.cos(a + d)},${y2 - s * Math.sin(a + d)}`
  return `<path d="M${x1} ${y1} L${x2} ${y2} M${p(0.5)} L${x2} ${y2} L${p(-0.5)}" stroke="${col}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
}
export const badge = (x, y, n, fill = C.ink) => `<circle cx="${x}" cy="${y}" r="13" fill="${fill}"/>${t(x, y + 5, n, { size: 14, weight: 800, fill: '#fff', anchor: 'middle' })}`
export const win = (x, y, w, h, o = {}) => card(x, y, w, h, o) + r(x, y, w, 26, { rx: 12, fill: C.soft }) + `<circle cx="${x + 14}" cy="${y + 13}" r="4" fill="${C.hot}"/><circle cx="${x + 28}" cy="${y + 13}" r="4" fill="${C.mid}"/><circle cx="${x + 42}" cy="${y + 13}" r="4" fill="${C.mid}"/>`
export const caption = (w, h, s) => t(w / 2, h - 16, s, { size: 14, weight: 500, fill: C.mute, anchor: 'middle' })
/** A row of numbered steps joined by arrows. steps = [[title, hint], ...] */
export function flow(steps, label, note) {
  const n = steps.length, w = 800, gap = 28, bw = (w - 40 - gap * (n - 1)) / n
  const body = steps.map(([title, hint], i) => {
    const x = 20 + i * (bw + gap)
    return card(x, 40, bw, 120) + badge(x + 22, 40, i + 1, C.hot) + t(x + bw / 2, 92, title, { size: 18, weight: 800, anchor: 'middle' }) +
      t(x + bw / 2, 120, hint, { size: 14, weight: 500, fill: C.mute, anchor: 'middle' }) + (i < n - 1 ? arrow(x + bw + 4, 100, x + bw + gap - 4, 100) : '')
  }).join('')
  return svg(w, 220, label, body + (note ? caption(w, 220, note) : ''))
}
