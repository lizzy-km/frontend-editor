import { C, svg, r, card, t, bar, bars, btn, arrow, win, caption, flow } from './kit.mjs'

const W = 800, H = 240
const mid = { anchor: 'middle', size: 15, weight: 800 }
const key = (x, y, s, w = 44) => r(x, y, w, 34, { fill: C.card, stroke: C.mid, sw: 2, rx: 8 }) + t(x + w / 2, y + 23, s, { size: 13, weight: 800, anchor: 'middle' })

export const interactive = {
  popups: svg(W, H, 'A button opens a pop-up box over the page',
    win(40, 30, 300, 180) + t(70, 90, 'Fresh bread', { size: 18, weight: 800 }) + btn(70, 112, 130, 'Open pop-up') + arrow(360, 115, 430, 115) +
    win(440, 30, 320, 180) + r(440, 56, 320, 154, { fill: '#2b262033', rx: 0 }) + card(480, 76, 240, 110) + t(600, 114, 'Join our list', { anchor: 'middle', size: 16, weight: 800 }) + bars(520, 128, [160, 120]) + t(706, 96, '×', { size: 18, weight: 800, fill: C.mute })),
  'ask-first': svg(W, H, 'Ask first: visitors must say Yes before the click goes through',
    btn(60, 100, 130, 'Delete', { fill: '#c0392b' }) + arrow(206, 115, 290, 115) +
    card(300, 40, 300, 150) + t(450, 90, 'Are you sure?', { anchor: 'middle', size: 18, weight: 800 }) + btn(340, 124, 100, 'Yes', { fill: C.hot }) + btn(460, 124, 100, 'No', { fill: C.soft, color: C.ink }) +
    arrow(616, 115, 690, 115, C.ok) + t(730, 120, 'Done', { anchor: 'middle', size: 15, weight: 800, fill: C.ok })),
  animation: svg(W, H, 'An element fades up when it scrolls into view',
    [0, 1, 2].map((i) => `<g opacity="${0.25 + i * 0.35}">` + card(60 + i * 240, 50 + (2 - i) * 18, 200, 110) + t(160 + i * 240, 110 + (2 - i) * 18, ['Start', 'Moving…', 'Done'][i], mid) + '</g>' + (i < 2 ? arrow(266 + i * 240, 110, 290 + i * 240, 110) : '')).join('') + caption(W, H, 'Pick an effect, when it plays, and how long. Press Play to preview.')),
  'show-hide': svg(W, H, 'Hide a box for a layer, a screen size or a kind of visitor',
    [['Layers', 'the eye hides it while you work', 'M10 30 q22 -26 44 0 q-22 26 -44 0z'], ['Screens', 'only on phones, tablets…', 'M12 12 h40 v28 h-40z'], ['Visitors', 'only for signed-in people', 'M32 8 a12 12 0 1 0 0.1 0z M12 46 q20 -22 40 0z']].map(([a, b, d], i) => {
      const x = 40 + i * 250
      return card(x, 30, 220, 160) + `<path d="${d}" transform="translate(${x + 78} 44)" fill="none" stroke="${C.hot}" stroke-width="3" stroke-linejoin="round"/>` + t(x + 110, 124, a, mid) + t(x + 110, 150, b, { anchor: 'middle', size: 12, weight: 500, fill: C.mute })
    }).join('')),
}

export const code = {
  downloads: svg(W, H, 'Download as a web page, a website, a React project or a picture',
    [['.html', 'Web page'], ['.zip', 'Website'], ['React', 'Project'], ['.png', 'Picture']].map(([a, b], i) => {
      const x = 40 + i * 185
      return card(x, 30, 150, 150) + r(x + 45, 48, 60, 70, { fill: i === 2 ? C.blueSoft : C.hotSoft, rx: 8 }) + t(x + 75, 90, a, { anchor: 'middle', size: 16, weight: 800, fill: i === 2 ? C.blue : C.hot }) + t(x + 75, 150, b, { anchor: 'middle', size: 14, weight: 700 })
    }).join('')),
  'react-project': flow([['Unzip', 'the download'], ['npm install', 'one time'], ['npm run dev', 'open the address'], ['.env', 'for live data']], 'Run your React project'),
  'react-view': svg(W, H, 'Select a part of the page to see its React component',
    win(40, 30, 280, 180) + t(70, 90, 'Fresh bread', { size: 18, weight: 800 }) + bars(70, 108, [180, 140]) + `<rect x="60" y="68" width="150" height="30" rx="5" fill="none" stroke="${C.hot}" stroke-width="2"/>` +
    arrow(340, 120, 410, 120) + r(420, 30, 340, 180, { fill: C.ink, rx: 14 }) +
    ['function Hero() {', '  return (', '    <h1>Fresh bread</h1>', '  )', '}'].map((s, i) => t(442, 66 + i * 26, s.replace(/^ +/, (m) => ' '.repeat(m.length)).replace(/</g, '&lt;').replace(/>/g, '&gt;'), { size: 14, weight: 500, fill: i === 2 ? '#ffb199' : '#e6e0d6' })).join('')),
}

export const help = {
  'fix-problems': svg(W, H, 'Look up the message you see, then follow the fix',
    [['“Couldn’t save”', 'Check your internet. Your work is kept.'], ['“Too big to save”', 'Move pictures out of the code.'], ['Menu is empty', 'Switch on Show in the menu.']].map(([a, b], i) =>
      card(40, 30 + i * 62, 720, 50) + r(52, 40 + i * 62, 190, 30, { fill: C.hotSoft, rx: 15 }) + t(147, 60 + i * 62, a, { anchor: 'middle', size: 13, weight: 800, fill: C.hot }) + arrow(256, 55 + i * 62, 300, 55 + i * 62, C.mute) + t(316, 60 + i * 62, b, { size: 14 })).join('')),
  shortcuts: svg(W, H, 'Common keyboard shortcuts',
    [[['Ctrl', 'Z'], 'Undo'], [['Ctrl', 'Y'], 'Redo'], [['Ctrl', 'D'], 'Copy'], [['Del'], 'Remove'], [['Esc'], 'Parent'], [['Ctrl', 'S'], 'Save']].map(([ks, s], i) => {
      const x = 40 + (i % 3) * 250, y = 30 + Math.floor(i / 3) * 90
      return ks.map((k, j) => key(x + j * 56, y, k, k.length > 3 ? 52 : 44)).join('') + t(x + (ks.length > 1 ? 116 : 62), y + 24, s, { size: 14, weight: 600 })
    }).join('') + caption(W, H, 'On a Mac use ⌘ instead of Ctrl.')),
  glossary: svg(W, H, 'An item is one thing in your data; fields are its details',
    card(40, 30, 250, 170) + r(54, 44, 222, 70, { fill: C.soft }) + t(60, 140, 'Sourdough', { size: 16, weight: 800 }) + t(60, 166, '$6', { size: 15, weight: 700, fill: C.hot }) +
    arrow(320, 70, 410, 70) + t(420, 76, 'field: picture', { size: 14, weight: 700 }) + arrow(320, 138, 410, 138) + t(420, 144, 'field: name', { size: 14, weight: 700 }) + arrow(320, 164, 410, 164) + t(420, 170, 'field: price', { size: 14, weight: 700 }) +
    t(165, 220, 'One item', { anchor: 'middle', size: 14, weight: 800, fill: C.hot })),
}
