/** The look of the ready-made layouts. Plain page CSS (class names lay-*): change it in the page's styles or per element. */

export const LAYOUT_START = '/* tweak-layout */'
export const LAYOUT_END = '/* /tweak-layout */'

const BASE = `body:has(.lay-top, .lay-side) { margin: 0 }
.lay-brand { font-weight: 800; font-size: 20px; color: inherit; text-decoration: none }
.lay-menu { display: flex; gap: 4px }
.lay-menu a, .lay-auth a, .lay-auth button { font: inherit; font-weight: 600; color: inherit; text-decoration: none; padding: 9px 14px; border: 0; border-radius: 10px; background: none; cursor: pointer }
.lay-menu a:hover, .lay-auth a:hover, .lay-auth button:hover { background: rgba(120, 113, 108, .14) }
.lay-menu a.active, .lay-menu a[aria-current="page"] { background: rgba(120, 113, 108, .22) }
.lay-auth { display: flex; align-items: center; gap: 6px }
.lay-auth .lay-cta { background: #1c1917; color: #fff }
.lay-burger, .lay-fab { display: none; font: inherit; font-size: 22px; line-height: 1; padding: 8px 12px; border: 1px solid #d6d3d1; border-radius: 10px; background: #fff; color: #1c1917; cursor: pointer }`

const TOP_BAR = `.lay-top { box-sizing: border-box; position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 24px; padding: 12px 28px; background: #fff; color: #1c1917; border-bottom: 1px solid #e7e5e4 }
.lay-top .lay-auth { margin-left: auto }`

const TOP_MENU = `.lay-top .lay-menu { flex: 1; align-items: center }
@media (max-width: 860px) {
  .lay-top { flex-wrap: wrap }
  .lay-top .lay-burger { display: block; margin-left: auto }
  .lay-top .lay-menu { display: none; flex: 1 0 100%; flex-direction: column; align-items: stretch }
  .lay-top .lay-menu .lay-auth { margin-left: 0; flex-direction: column; align-items: stretch }
  body.menu-open .lay-top .lay-menu { display: flex }
}`

const SIDE_BAR = `body:has(.lay-side) { padding-left: 248px }
.lay-side { box-sizing: border-box; position: fixed; top: 0; left: 0; bottom: 0; width: 248px; z-index: 50; display: flex; flex-direction: column; gap: 20px; padding: 24px 14px; background: #1c1917; color: #fafaf9; overflow: auto }
.lay-side .lay-menu { flex-direction: column }
.lay-side .lay-auth { margin-top: auto; flex-direction: column; align-items: stretch }
.lay-side .lay-menu a:hover, .lay-side .lay-auth a:hover, .lay-side .lay-auth button:hover { background: rgba(255, 255, 255, .1) }
.lay-side .lay-menu a.active, .lay-side .lay-menu a[aria-current="page"] { background: rgba(255, 255, 255, .16) }
.lay-side .lay-auth .lay-cta { background: #fafaf9; color: #1c1917 }`

const SIDE_PHONE = `  body:has(.lay-side) { padding-left: 0 }
  .lay-side { transform: translateX(-100%); transition: transform .2s; padding-top: 72px }
  body.menu-open .lay-side { transform: none }`

const SIDE = `${SIDE_BAR}
.lay-fab { position: fixed; top: 12px; left: 12px; z-index: 60 }
@media (max-width: 860px) {
${SIDE_PHONE}
  .lay-fab { display: block }
  body:has(.lay-fab) { padding-top: 64px }
}`

/** A top bar across the page, over a side menu. */
const BOTH = `${SIDE_BAR}
${TOP_BAR}
.lay-top.lay-wide { margin-left: -248px; height: 64px }
.lay-side.lay-under { top: 64px }
@media (max-width: 860px) {
${SIDE_PHONE}
  .lay-top.lay-wide { margin-left: 0 }
  .lay-top.lay-wide .lay-burger { display: block }
}`

/** The CSS block for a layout, between markers so it can be replaced later. */
export const layoutCss = (kind: 'top' | 'side' | 'both') =>
  [LAYOUT_START, BASE, kind === 'top' ? [TOP_BAR, TOP_MENU].join('\n') : kind === 'side' ? SIDE : BOTH, LAYOUT_END].join('\n')

/** The page CSS without the layout block. */
export function stripLayoutCss(css: string): string {
  const start = css.indexOf(LAYOUT_START)
  const end = css.indexOf(LAYOUT_END)
  if (start < 0 || end < start) return css
  return (css.slice(0, start) + css.slice(end + LAYOUT_END.length)).replace(/\n{3,}/g, '\n\n').trim()
}
