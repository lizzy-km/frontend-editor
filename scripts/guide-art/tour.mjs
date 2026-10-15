import { C, svg, r, card, t, bars, btn, pic, arrow, win, caption } from './kit.mjs'

const W = 800, H = 240
const mid = { anchor: 'middle', size: 15, weight: 800 }
const dev = (x, y, w, h, label) =>
  r(x, y, w, h, { fill: C.card, stroke: C.ink, sw: 3, rx: 12 }) + bars(x + 12, y + 18, [w * 0.5, w * 0.35]) +
  r(x + 12, y + h - 40, w * 0.4, 22, { fill: C.hot, rx: 11 }) + t(x + w / 2, y + h + 26, label, mid)

export const tour = {
  'screen-sizes': svg(W, H, 'Computer, tablet and phone', dev(40, 20, 280, 160, 'Computer') + dev(400, 30, 170, 150, 'Tablet') + dev(650, 40, 90, 140, 'Phone')),
  preview: svg(W, H, 'Preview shows your page like a visitor, with a Viewing as menu',
    win(40, 30, 500, 180) + t(70, 90, 'Fresh bread', { size: 20, weight: 800 }) + bars(70, 108, [220, 180]) + btn(70, 144, 100, 'Order now') + pic(360, 50, 160, 110) +
    r(570, 40, 190, 36, { fill: C.hotSoft, rx: 18 }) + t(665, 63, 'Viewing as: Visitor ▾', { size: 13, weight: 700, fill: C.hot, anchor: 'middle' }) +
    r(570, 90, 190, 36, { stroke: C.line, rx: 18 }) + t(665, 113, 'Back to editing', { size: 13, weight: 700, anchor: 'middle' }) +
    t(665, 170, 'Click things like a visitor', { size: 13, weight: 500, fill: C.mute, anchor: 'middle' })),
}

export const looks = {
  words: svg(W, H, 'Double-click text and use the text settings',
    card(40, 40, 420, 140) + t(70, 100, 'Fresh bread, every morning', { size: 26, weight: 800 }) + bars(70, 124, [300, 240]) +
    `<rect x="64" y="72" width="360" height="40" rx="5" fill="none" stroke="${C.hot}" stroke-width="2"/>` +
    card(500, 40, 260, 140) + t(520, 70, 'Text', { size: 14, weight: 800 }) + r(520, 84, 100, 28, { fill: C.soft }) + t(530, 103, 'Size 26', { size: 12 }) +
    r(632, 84, 108, 28, { fill: C.soft }) + t(642, 103, 'Bold', { size: 12, weight: 800 }) +
    r(520, 126, 28, 28, { fill: C.ink, rx: 14 }) + r(556, 126, 28, 28, { fill: C.hot, rx: 14 }) + r(592, 126, 28, 28, { fill: C.ok, rx: 14 }) +
    caption(W, H, 'Double-click the words to type; change size and color on the right.')),
  'max-lines': svg(W, H, 'Max lines cuts long text with three dots',
    card(60, 30, 300, 150) + bars(80, 56, [250, 240, 260, 230, 250, 200], 18) + t(210, 208, 'No limit', mid) +
    arrow(380, 105, 440, 105) +
    card(450, 30, 300, 150) + bars(470, 56, [250, 240], 18) + t(470, 118, '…', { size: 26, weight: 800, fill: C.hot }) + t(600, 208, 'Max lines: 2', mid)),
  pictures: svg(W, H, 'Click a picture, then choose a new one',
    pic(60, 40, 260, 160) + `<rect x="56" y="36" width="268" height="168" rx="8" fill="none" stroke="${C.hot}" stroke-width="2"/>` +
    arrow(340, 120, 420, 120) + card(430, 40, 310, 160) + t(450, 70, 'Picture', { size: 14, weight: 800 }) + btn(450, 86, 150, 'Choose picture') +
    t(450, 146, 'Description (for screen readers)', { size: 12, weight: 500, fill: C.mute }) + r(450, 156, 270, 28, { fill: C.soft })),
  background: svg(W, H, 'A background can be a color, a picture or a gradient',
    `<defs><linearGradient id="g"><stop offset="0" stop-color="${C.hot}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient></defs>` +
    `<rect x="70" y="40" width="190" height="130" rx="14" fill="${C.hot}"/>` + pic(305, 40, 190, 130) + `<rect x="540" y="40" width="190" height="130" rx="14" fill="url(#g)"/>` +
    t(165, 205, 'Color', mid) + t(400, 205, 'Picture', mid) + t(635, 205, 'Gradient', mid)),
  'size-space': svg(W, H, 'Space inside, space around and the border of a box',
    r(180, 14, 440, 212, { fill: C.okSoft, rx: 10 }) + t(400, 34, 'Space around (outside)', { anchor: 'middle', size: 12, fill: C.ok }) +
    r(220, 46, 360, 150, { stroke: C.ink, sw: 3, rx: 8 }) + t(400, 66, 'Border', { anchor: 'middle', size: 12 }) +
    r(250, 76, 300, 106, { fill: C.hotSoft, rx: 6 }) + t(400, 96, 'Space inside', { anchor: 'middle', size: 12, fill: C.hot }) +
    r(310, 112, 180, 40, { rx: 6 }) + t(400, 138, 'Your content', { anchor: 'middle', size: 14, weight: 700 })),
}
