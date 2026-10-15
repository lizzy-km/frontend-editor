import { C, svg, r, card, t, bar, bars, btn, arrow, caption } from './kit.mjs'

const W = 800, H = 240
const mid = { anchor: 'middle', size: 14, weight: 700 }
const input = (x, y, w, label) => t(x, y - 6, label, { size: 12, weight: 700 }) + r(x, y, w, 34, { stroke: C.mid, rx: 10 })
const chip = (x, y, w, s, on) => r(x, y, w, 28, { rx: 14, fill: on ? C.hot : C.card, stroke: on ? C.hot : C.mid }) + t(x + w / 2, y + 19, s, { size: 12, weight: 700, fill: on ? '#fff' : C.ink, anchor: 'middle' })

export const widgets = {
  'widget-inputs': svg(W, H, 'Inputs, switches and select lists you add with one click',
    input(30, 50, 200, 'Email') + r(40, 58, 18, 18, { fill: C.soft, rx: 4 }) +
    input(30, 120, 200, 'Password') + t(190, 142, 'Show', { size: 12, weight: 700, fill: C.hot }) +
    r(270, 44, 220, 34, { stroke: C.hot, sw: 2, rx: 10 }) + t(280, 66, 'Choose one', { size: 13, fill: C.mute }) + t(472, 66, '▾', { size: 14 }) +
    card(270, 84, 220, 100, { stroke: C.line }) + t(284, 110, 'United States', { size: 13 }) + r(278, 120, 204, 26, { fill: C.hotSoft, rx: 8 }) + t(284, 138, 'Canada', { size: 13, weight: 700, fill: C.hot }) + t(284, 170, 'Germany', { size: 13 }) +
    t(530, 60, 'Notifications', { size: 13 }) + r(690, 44, 56, 30, { fill: C.hot, rx: 15 }) + `<circle cx="731" cy="59" r="11" fill="#fff"/>` +
    t(530, 120, 'Weekly summary', { size: 13 }) + r(690, 104, 56, 30, { fill: C.mid, rx: 15 }) + `<circle cx="705" cy="119" r="11" fill="#fff"/>` +
    caption(W, H, 'Text, email, password, number, text area, switch and select: choose from Add → Inputs.')),
  'widget-tabs': svg(W, H, 'Tabs show one panel at a time; a drop-down menu lists links',
    card(30, 30, 440, 150) + t(52, 62, 'Overview', { size: 14, weight: 800, fill: C.hot }) + r(48, 70, 76, 3, { fill: C.hot, rx: 2 }) + t(150, 62, 'Features', { size: 14, weight: 700, fill: C.mute }) + t(250, 62, 'Pricing', { size: 14, weight: 700, fill: C.mute }) +
    r(30, 74, 440, 1.5, { fill: C.line, rx: 0 }) + t(52, 112, 'Overview', { size: 17, weight: 800 }) + bars(52, 124, [300, 240, 270]) +
    r(520, 36, 120, 36, { stroke: C.hot, sw: 2, rx: 10 }) + t(580, 59, 'Options ▾', { anchor: 'middle', size: 14, weight: 700 }) +
    card(520, 80, 190, 112, { stroke: C.line }) + ['Edit', 'Duplicate', 'Share'].map((s, i) => t(540, 106 + i * 24, s, { size: 13 })).join('') + t(540, 180, 'Delete', { size: 13, fill: '#b91c1c' }) +
    caption(W, H, 'Four tab looks, any content in each panel, and a dropdown menu.')),
  'widget-dates': svg(W, H, 'A calendar and a date picker',
    card(30, 20, 230, 180) + t(145, 46, 'October 2026', { size: 14, weight: 800, anchor: 'middle' }) +
    Array.from({ length: 28 }, (_, i) => `<circle cx="${50 + (i % 7) * 30}" cy="${70 + Math.floor(i / 7) * 28}" r="${i === 14 ? 12 : 0}" fill="${C.hot}"/>` + t(50 + (i % 7) * 30, 75 + Math.floor(i / 7) * 28, String(i + 1), { size: 11, weight: i === 14 ? 800 : 500, fill: i === 14 ? '#fff' : C.ink, anchor: 'middle' })).join('') +
    t(30 + 350, 70, 'Date', { size: 12, weight: 700 }) + r(380, 78, 200, 34, { stroke: C.hot, sw: 2, rx: 10 }) + t(392, 100, '2026-10-15', { size: 13 }) +
    card(380, 120, 200, 70, { stroke: C.line }) + t(480, 150, '‹   October   ›', { anchor: 'middle', size: 13, weight: 700 }) + bars(396, 164, [168, 140], 12) +
    caption(W, H, 'People pick a day by clicking, or by typing. Set the first day of the week, formats and limits.')),
  'widget-tables': svg(W, H, 'A table with sortable headings and status badges',
    card(40, 30, 720, 160) + r(40, 30, 720, 34, { fill: C.soft, rx: 12 }) + ['NAME ↑', 'ROLE', 'STATUS', 'SALARY'].map((s, i) => t(64 + i * 170, 52, s, { size: 12, weight: 800, fill: C.mute })).join('') +
    [['Ava Martin', 'Designer', 'Active', '$4,200'], ['Noah Kim', 'Developer', 'Active', '$5,100'], ['Mia Rossi', 'Marketing', 'Invited', '$3,600']].map((row, i) => row.map((s, j) => j === 2 ? r(60 + j * 170, 78 + i * 36, 60, 22, { fill: s === 'Active' ? C.okSoft : '#fef3c7', rx: 11 }) + t(90 + j * 170, 94 + i * 36, s, { size: 11, weight: 700, anchor: 'middle', fill: s === 'Active' ? C.ok : '#92400e' }) : t(64 + j * 170, 94 + i * 36, s, { size: 13 })).join('')).join('') +
    caption(W, H, 'Type the cells yourself, or build the table from your data. Click a heading to sort.')),
  'widget-search': svg(W, H, 'A search bar and filter buttons narrow a list as people type',
    r(30, 24, 300, 38, { stroke: C.hot, sw: 2, rx: 19 }) + t(60, 48, 'lamp', { size: 14 }) + t(300, 48, '×', { size: 16, fill: C.mute }) +
    chip(360, 28, 52, 'All') + chip(420, 28, 82, 'Clothing') + chip(510, 28, 64, 'Bags') + chip(582, 28, 66, 'Home', true) +
    [0, 1, 2].map((i) => card(30 + i * 250, 84, 230, 100, { stroke: i === 2 ? C.hot : C.line }) + r(44 + i * 250, 96, 60, 60, { fill: C.soft, rx: 8 }) + bars(116 + i * 250, 106, [96, 70, 50], 16)).join('') +
    caption(W, H, 'Connect it to “List from data” or “Table from data”. A filter can offer the real values of a field.')),
}
