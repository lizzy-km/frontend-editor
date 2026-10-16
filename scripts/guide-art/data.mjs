import { C, svg, r, card, t, bar, bars, btn, pic, arrow, win, caption } from './kit.mjs'

const W = 800, H = 240
const mid = { anchor: 'middle', size: 15, weight: 800 }
const tile = (x, y, w, h) => card(x, y, w, h) + pic(x + 10, y + 10, w - 20, h * 0.45) + bar(x + 10, y + h * 0.65, w * 0.6) + bar(x + 10, y + h * 0.65 + 16, w * 0.35, C.hot)

export const forms = {
  'add-form': svg(W, H, 'A contact form with a name, an email, a message and a Send button',
    win(60, 30, 320, 180) + r(84, 66, 272, 26, { fill: C.soft }) + t(94, 84, 'Your name', { size: 12, weight: 500, fill: C.mute }) + r(84, 100, 272, 26, { fill: C.soft }) + t(94, 118, 'Email', { size: 12, weight: 500, fill: C.mute }) + r(84, 134, 272, 40, { fill: C.soft }) + btn(84, 180, 90, 'Send') +
    card(430, 40, 310, 150) + t(450, 70, 'Form settings', { size: 14, weight: 800 }) + r(450, 86, 40, 22, { rx: 11, fill: C.ok }) + t(500, 102, 'Check the answers and send them', { size: 12 }) + t(450, 140, 'Send to', { size: 12, weight: 500, fill: C.mute }) + r(450, 148, 270, 26, { fill: C.soft })),
  'form-rules': svg(W, H, 'A box can require an answer and show your own error message',
    card(40, 30, 340, 170) + t(60, 60, 'Email', { size: 13, weight: 700 }) + r(60, 70, 300, 32, { fill: C.card, stroke: C.hot, sw: 2 }) + t(60, 124, 'Please type your email address', { size: 13, weight: 600, fill: C.hot }) + btn(60, 150, 90, 'Send') +
    arrow(400, 115, 450, 115) + card(460, 30, 300, 170) + t(480, 60, 'Rules for this box', { size: 14, weight: 800 }) + ['Must be filled in', 'Must be an email', 'Own error message'].map((s, i) => r(480, 76 + i * 36, 22, 22, { rx: 6, fill: C.ok }) + t(512, 92 + i * 36, s, { size: 13 })).join('')),
  'form-kinds': svg(W, H, 'Log in, sign up and reset-password forms',
    [['Log in', ['Email', 'Password']], ['Sign up', ['Name', 'Email', 'Password']], ['Reset', ['Email']]].map(([a, f], i) => {
      const x = 40 + i * 250
      return win(x, 24, 220, 170) + t(x + 110, 64, a, { anchor: 'middle', size: 15, weight: 800 }) + f.map((s, j) => r(x + 24, 76 + j * 28, 172, 20, { fill: C.soft }) + t(x + 32, 91 + j * 28, s, { size: 11, weight: 500, fill: C.mute })).join('') + btn(x + 60, 76 + f.length * 28 + 4, 100, a)
    }).join('')),
}

export const dataArt = {
  'add-data': svg(W, H, 'A data set is a table of items with fields',
    card(40, 30, 440, 170) + r(40, 30, 440, 30, { rx: 12, fill: C.soft }) + ['id', 'name', 'price', 'picture'].map((s, i) => t(60 + i * 104, 50, s, { size: 13, weight: 800 })).join('') +
    [0, 1, 2].map((i) => ['1', 'Sourdough', '$6', '▣'].map((s, j) => t(60 + j * 104, 86 + i * 36, i === 0 || j ? s : String(i + 1), { size: 13, weight: 500 })).join('')).join('') +
    btn(60, 164, 100, '+ Add row', { fill: C.hot }) + arrow(500, 115, 560, 115) + t(655, 100, 'Starter sets', { anchor: 'middle', size: 15, weight: 800 }) + ['Products', 'Blog posts', 'Team'].map((s, i) => r(560 + i * 70 - (i ? 0 : 0), 120, 66, 26, { rx: 13, fill: C.hotSoft }) + t(593 + i * 70, 137, s, { size: 11, weight: 700, fill: C.hot, anchor: 'middle' })).join('')),
  'import-json': svg(W, H, 'Paste or drop a JSON file to fill a data set',
    card(40, 30, 220, 170) + r(54, 46, 192, 22, { fill: C.ink, rx: 6 }) + t(66, 62, '[ { "name": "Rye" } ]', { size: 11, fill: '#fff' }) + t(150, 100, '.json file', { anchor: 'middle', size: 15, weight: 800 }) + t(150, 124, 'paste or drop it', { anchor: 'middle', size: 12, weight: 500, fill: C.mute }) +
    arrow(280, 115, 360, 115) + t(320, 100, 'Import', { anchor: 'middle', size: 13, weight: 700, fill: C.hot }) +
    card(370, 30, 390, 170) + r(370, 30, 390, 30, { rx: 12, fill: C.soft }) + t(390, 50, 'name', { size: 13, weight: 800 }) + t(520, 50, 'price', { size: 13, weight: 800 }) + [0, 1, 2].map((i) => t(390, 88 + i * 34, ['Rye', 'Bagel', 'Bun'][i], { size: 13, weight: 500 }) + t(520, 88 + i * 34, ['$5', '$3', '$2'][i], { size: 13, weight: 500 })).join('')),
  'connect-api': svg(W, H, 'Connect your own API and its items appear in your page',
    card(40, 50, 190, 130) + t(135, 100, 'Your API', { anchor: 'middle', size: 16, weight: 800 }) + t(135, 126, 'https://…/products', { anchor: 'middle', size: 11, weight: 500, fill: C.mute }) +
    arrow(242, 115, 320, 115) + t(280, 100, 'Test', { anchor: 'middle', size: 13, weight: 700, fill: C.hot }) +
    card(330, 50, 160, 130) + t(410, 100, 'Items', { anchor: 'middle', size: 16, weight: 800 }) + t(410, 126, 'name · price · id', { anchor: 'middle', size: 12, weight: 500, fill: C.mute }) +
    arrow(502, 115, 560, 115) + tile(570, 36, 90, 150) + tile(670, 36, 90, 150)),
  'item-address': svg(W, H, 'An address with :id gives one item',
    r(40, 60, 720, 50, { fill: C.card, stroke: C.line, rx: 25 }) + t(70, 92, 'https://api.example.com/products/', { size: 18, weight: 600, fill: C.mute }) + r(442, 70, 56, 30, { fill: C.hotSoft, rx: 15 }) + t(470, 92, ':id', { size: 18, weight: 800, fill: C.hot, anchor: 'middle' }) +
    arrow(470, 118, 470, 148) + t(470, 175, 'becomes 7 when you open /product/7', { anchor: 'middle', size: 15, weight: 700 }) + caption(W, H, 'Each page shows its own item.')),
  'show-data': svg(W, H, 'Boxes show the fields of an item or every item of a list',
    card(40, 30, 240, 170) + pic(54, 44, 212, 80) + t(60, 150, 'Sourdough', { size: 15, weight: 800 }) + t(60, 174, '$6', { size: 14, weight: 700, fill: C.hot }) + t(160, 214, 'One item', { anchor: 'middle', size: 13, weight: 700 }) +
    t(330, 115, 'or', { anchor: 'middle', size: 15, fill: C.mute }) + tile(380, 30, 108, 170) + tile(500, 30, 108, 170) + tile(620, 30, 108, 170)),
  'card-click': svg(W, H, 'Click a card to open that item’s page',
    tile(60, 30, 130, 170) + tile(210, 30, 130, 170) + `<rect x="206" y="26" width="138" height="178" rx="14" fill="none" stroke="${C.hot}" stroke-width="3"/>` +
    arrow(360, 115, 450, 115) + t(405, 98, 'click', { anchor: 'middle', size: 13, weight: 700, fill: C.hot }) +
    win(460, 30, 290, 170) + pic(476, 66, 110, 110) + t(600, 100, 'Croissant', { size: 17, weight: 800 }) + bars(600, 116, [120, 90]) + t(600, 170, '$4', { size: 16, weight: 800, fill: C.hot })),
}

export const cardPopupArt = {
  'card-popup': svg(W, H, 'A card opens a pop-up that shows that card’s item, with a button to its own page',
    [0, 1, 2].map((i) => tile(26 + i * 112, 34, 100, 150).replace(/stroke="#e4ddd2"/, i === 1 ? `stroke="${C.hot}"` : 'stroke="#e4ddd2"')).join('') +
    t(188, 212, 'Click a card', { anchor: 'middle', size: 13, weight: 700 }) + arrow(366, 110, 424, 110) +
    r(436, 20, 340, 190, { fill: '#2b262022', rx: 16 }) + card(468, 42, 276, 146) + pic(484, 58, 96, 96) + t(598, 82, 'Item 2', { size: 16, weight: 800 }) + bars(598, 98, [110, 80], 14) + t(598, 150, '$22', { size: 15, weight: 800, fill: C.hot }) +
    btn(598, 156, 130, 'See details →') + t(606, 232, 'The pop-up shows the clicked item and can open its page', { anchor: 'middle', size: 12, weight: 500, fill: C.mute })),
}
