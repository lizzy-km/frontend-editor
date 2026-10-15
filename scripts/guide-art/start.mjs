import { C, svg, r, card, t, bar, bars, btn, arrow, win, flow } from './kit.mjs'

const W = 800, H = 240
const mid = { anchor: 'middle', size: 14, weight: 700 }

export const start = {
  'what-is-tweak': svg(W, H, 'AI code becomes a page you change by clicking, then you share it',
    card(30, 40, 190, 130) + r(46, 58, 158, 22, { fill: C.ink, rx: 6 }) + t(60, 74, '&lt;html&gt; …', { size: 12, fill: '#fff' }) + bars(46, 98, [120, 100, 130, 80]) + t(125, 195, 'Code from an AI', mid) +
    arrow(232, 105, 290, 105) +
    win(300, 40, 200, 130) + t(330, 90, 'Fresh bread', { size: 16, weight: 800 }) + bars(318, 104, [120, 90]) + btn(318, 134, 80, 'Order') +
    `<rect x="312" y="72" width="110" height="26" rx="5" fill="none" stroke="${C.hot}" stroke-width="2" stroke-dasharray="5 3"/>` + t(400, 195, 'Click to change it', mid) +
    arrow(512, 105, 570, 105) +
    card(580, 40, 190, 130) + t(675, 90, 'Share a link', { anchor: 'middle', size: 15, weight: 800 }) + r(600, 104, 150, 26, { fill: C.hotSoft, rx: 13 }) + t(675, 122, 'tweak.app/you', { anchor: 'middle', size: 12, fill: C.hot }) + t(675, 195, 'Or download it', mid)),
  'first-page': flow([['Try it', 'on the home page'], ['Paste', 'your AI answer'], ['Click', 'and change'], ['Preview', 'check it works']], 'Four steps to your first page', 'No account is needed to start.'),
  'account-and-saving': svg(W, H, 'Your work is kept in the browser until you save it to an account',
    win(30, 40, 200, 130) + t(130, 195, 'In your browser', mid) + bars(48, 84, [130, 100, 120]) +
    arrow(244, 105, 320, 105) + t(282, 90, 'Save', { anchor: 'middle', size: 13, weight: 700, fill: C.hot }) +
    card(330, 50, 150, 110) + t(405, 100, 'Your account', { anchor: 'middle', size: 15, weight: 800 }) + t(405, 124, 'saved safely', { anchor: 'middle', size: 12, weight: 500, fill: C.mute }) +
    arrow(494, 105, 560, 105) + card(570, 40, 200, 130) + t(670, 90, 'Share', { anchor: 'middle', size: 16, weight: 800 }) + t(670, 116, 'Download', { anchor: 'middle', size: 16, weight: 800 }) + t(670, 142, 'Open anywhere', { anchor: 'middle', size: 13, weight: 500, fill: C.mute })),
  'project-kinds': svg(W, H, 'One page versus a website with several pages',
    win(40, 40, 220, 130) + bars(60, 84, [150, 110, 130]) + t(150, 200, 'One page', { anchor: 'middle', size: 15, weight: 800 }) +
    t(400, 110, 'or', { anchor: 'middle', size: 16, weight: 600, fill: C.mute }) +
    win(540, 40, 130, 100) + win(570, 56, 130, 100) + win(600, 72, 130, 100) + bar(616, 108, 60, C.hot, 5) + bar(616, 122, 90) + t(650, 200, 'A website: many pages', { anchor: 'middle', size: 15, weight: 800 })),
}

export const recipes = {
  'recipe-landing': flow([['Ask AI', 'for a page'], ['Paste', 'Open in editor'], ['Change', 'words, colors'], ['Phone', 'check the size'], ['Share', 'or download']], 'Landing page recipe'),
  'recipe-shop': flow([['Add data', 'Products'], ['List', 'Add → List'], ['Detail page', 'Add a page'], ['On click', 'Open page'], ['Preview', 'click a card']], 'Shop recipe'),
  'recipe-members': flow([['Sign-in pages', 'Pages tab'], ['Signed in', 'protect a page'], ['Layout', 'menu buttons'], ['Viewing as', 'test roles']], 'Members area recipe'),
  'recipe-contact': flow([['Add form', 'Contact form'], ['Turn on', 'check answers'], ['Rules', 'for each box'], ['Send to', 'thank-you text']], 'Contact form recipe'),
}
