import { C, svg, r, card, t, bar, bars, btn, arrow, win, caption } from './kit.mjs'

const W = 800, H = 240
const mid = { anchor: 'middle', size: 15, weight: 800 }
const chip = (x, y, w, s, on) => r(x, y, w, 28, { rx: 14, fill: on ? C.hotSoft : C.card, stroke: on ? C.hot : C.line }) + t(x + w / 2, y + 19, s, { size: 13, weight: 700, fill: on ? C.hot : C.ink, anchor: 'middle' })
/** A tiny site: top bar and/or side menu around some content. */
const mini = (x, y, top, side, label) =>
  card(x, y, 220, 140) + (top ? r(x, y, 220, 26, { fill: C.hotSoft, rx: 12 }) + [0, 1, 2].map((i) => bar(x + 14 + i * 38, y + 10, 28, C.hot, 6)).join('') : '') +
  (side ? r(x, y + (top ? 26 : 0), 56, 140 - (top ? 26 : 0), { fill: C.blueSoft, rx: 0 }) + [0, 1, 2].map((i) => bar(x + 10, y + (top ? 42 : 18) + i * 18, 36, C.blue, 6)).join('') : '') +
  bars(x + (side ? 70 : 16), y + (top ? 48 : 22), [side ? 120 : 160, 100, side ? 110 : 140]) + t(x + 110, y + 168, label, mid)

export const website = {
  pages: svg(W, H, 'The pages of a website, with one shared header and footer',
    card(40, 30, 260, 180) + t(60, 58, 'Pages', { size: 14, weight: 800 }) + chip(56, 70, 160, 'Home', true) + chip(56, 104, 160, 'About us') + chip(56, 138, 160, 'Contact') + r(56, 174, 160, 28, { rx: 14, stroke: C.hot, dash: true, fill: 'none' }) + t(136, 193, '+ Add a page', { size: 13, weight: 700, fill: C.hot, anchor: 'middle' }) +
    arrow(320, 120, 400, 120) +
    win(420, 30, 340, 180) + r(420, 56, 340, 24, { fill: C.hotSoft, rx: 0 }) + t(436, 72, 'Header (on every page)', { size: 12, fill: C.hot }) + t(590, 130, 'The page you chose', { anchor: 'middle', size: 15, weight: 800 }) + bars(480, 146, [220, 160]) + r(420, 186, 340, 24, { fill: C.soft, rx: 0 }) + t(436, 202, 'Footer (on every page)', { size: 12, fill: C.mute })),
  links: svg(W, H, 'A button or link can open another page',
    win(40, 30, 280, 170) + t(70, 90, 'Our menu', { size: 18, weight: 800 }) + btn(70, 112, 120, 'See pricing') + `<rect x="64" y="104" width="132" height="46" rx="8" fill="none" stroke="${C.hot}" stroke-width="2" stroke-dasharray="5 3"/>` +
    arrow(340, 125, 450, 125) + t(395, 108, 'click', { anchor: 'middle', size: 13, weight: 700, fill: C.hot }) +
    win(470, 30, 280, 170) + t(500, 90, 'Pricing', { size: 18, weight: 800 }) + bars(500, 108, [180, 140, 160]) + caption(W, H, 'Select it → Actions → When clicked → Link to a page')),
  layouts: svg(W, H, 'Layouts: top bar, side menu or both',
    mini(30, 20, true, false, 'Top bar') + mini(290, 20, false, true, 'Side menu') + mini(550, 20, true, true, 'Both')),
  'detail-pages': '',
  components: svg(W, H, 'Change the main component once and every copy follows, except what a copy changed itself',
    card(30, 40, 200, 150, { stroke: C.hot, dash: true }) + t(130, 32, 'Main component', { anchor: 'middle', size: 13, weight: 800, fill: C.hot }) + r(46, 56, 168, 56, { fill: C.soft }) + t(46, 140, 'Title', { size: 16, weight: 800 }) + bars(46, 154, [120, 90], 12) +
    [0, 1, 2].map((i) => arrow(244, 90 + (i - 1) * 40, 300, 90 + (i - 1) * 40) + card(310 + i * 150, 40, 130, 150) + r(322 + i * 150, 54, 106, 44, { fill: C.soft }) + t(322 + i * 150, 126, i === 1 ? 'My own title' : 'Title', { size: 13, weight: 800, fill: i === 1 ? C.hot : C.ink }) + bars(322 + i * 150, 142, [90, 60], 12)).join('') +
    t(550, 214, 'Copies follow the main one. A copy keeps what it changed itself.', { anchor: 'middle', size: 13, weight: 500, fill: C.mute })),
  'signin-pages': svg(W, H, 'Log in, sign up and account pages are added for you',
    [['Log in', 'email + password'], ['Sign up', 'make an account'], ['Account', 'only signed-in people']].map(([a, b], i) => {
      const x = 40 + i * 250
      return win(x, 30, 220, 150) + t(x + 110, 90, a, { anchor: 'middle', size: 17, weight: 800 }) + r(x + 24, 104, 172, 18, { fill: C.soft }) + r(x + 24, 128, 172, 18, { fill: C.soft }) + t(x + 110, 206, b, { anchor: 'middle', size: 13, weight: 500, fill: C.mute })
    }).join('')),
}

export const access = {
  'roles-flags': svg(W, H, 'Roles say who a person is; flags switch features on or off',
    card(40, 30, 340, 170) + t(60, 60, 'Roles (who someone is)', { size: 14, weight: 800 }) + chip(60, 80, 90, 'member', true) + chip(160, 80, 90, 'admin') + chip(260, 80, 100, 'staff') + t(60, 150, 'Show a page or box only to some roles', { size: 12, weight: 500, fill: C.mute }) +
    card(420, 30, 340, 170) + t(440, 60, 'Flags (features on or off)', { size: 14, weight: 800 }) +
    ['newMenu', 'betaShop'].map((f, i) => t(440, 100 + i * 40, f, { size: 14 }) + r(660, 82 + i * 40, 52, 26, { rx: 13, fill: i ? C.mid : C.ok }) + `<circle cx="${i ? 673 : 699}" cy="${95 + i * 40}" r="10" fill="#fff"/>`).join('')),
  'viewing-as': svg(W, H, 'Viewing as: choose a visitor, member or admin to test your site',
    card(40, 30, 250, 170) + t(60, 60, 'Viewing as', { size: 14, weight: 800 }) + ['Visitor', 'Member', 'Admin'].map((s, i) => `<circle cx="72" cy="${92 + i * 34}" r="8" fill="${i === 1 ? C.hot : C.card}" stroke="${i === 1 ? C.hot : C.mid}" stroke-width="2"/>` + t(92, 97 + i * 34, s, { size: 14 })).join('') +
    arrow(310, 115, 390, 115) + win(410, 30, 350, 170) + r(410, 56, 350, 24, { fill: C.hotSoft, rx: 0 }) + t(426, 72, 'Home · Orders · Account', { size: 12, fill: C.hot }) + t(585, 130, 'What a member sees', { anchor: 'middle', size: 15, weight: 800 }) + bars(480, 148, [220, 160])),
  'real-signin': svg(W, H, 'The React project signs people in for real',
    card(40, 40, 200, 130) + t(140, 90, 'Demo accounts', { anchor: 'middle', size: 15, weight: 800 }) + t(140, 116, 'admin@example.com', { anchor: 'middle', size: 12, weight: 500, fill: C.mute }) + t(140, 200, 'Works right away', { anchor: 'middle', size: 14, weight: 700 }) +
    t(300, 112, 'then', { anchor: 'middle', size: 14, fill: C.mute }) + arrow(260, 125, 340, 125) +
    card(350, 40, 200, 130) + t(450, 90, 'Your own API', { anchor: 'middle', size: 15, weight: 800 }) + t(450, 116, 'real people, real roles', { anchor: 'middle', size: 12, weight: 500, fill: C.mute }) + t(450, 200, 'Data → Sign-in API', { anchor: 'middle', size: 14, weight: 700 }) +
    card(590, 40, 170, 130) + t(675, 100, 'Private pages', { anchor: 'middle', size: 15, weight: 800 }) + t(675, 126, 'stay private', { anchor: 'middle', size: 13, weight: 500, fill: C.mute }) + arrow(558, 105, 582, 105)),
}
