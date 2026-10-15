/** Page CSS of the ready-made parts: plain rules on ui-* classes. Change them in the page's styles, or per element in the editor. */

export const BASE = `[data-ui] [hidden], [data-ui][hidden] { display: none !important }
.ui-label { font-size: 14px; font-weight: 600; color: #1c1917 }
.ui-help { margin: 0; font-size: 13px; color: #78716c }
.ui-input { width: 100%; box-sizing: border-box; font: inherit; padding: 11px 14px; border: 1px solid #d6d3d1; border-radius: 10px; background: #fff; color: #1c1917 }
.ui-input:focus { outline: 0; border-color: #4f46e5; box-shadow: 0 0 0 3px #e0e7ff }
.ui-input::placeholder { color: #a8a29e }
.ui-input-wrap { position: relative; display: flex; align-items: center }
.ui-input-wrap > svg { position: absolute; left: 13px; width: 18px; height: 18px; color: #78716c; pointer-events: none }
.ui-input-icon .ui-input { padding-left: 40px }
.ui-ghost { position: absolute; right: 8px; padding: 6px 8px; border: 0; border-radius: 8px; background: none; font: inherit; font-size: 13px; font-weight: 600; color: #4f46e5; cursor: pointer }
.ui-ghost:hover { background: #eef2ff }
.ui-chevron { flex: none; width: 16px; height: 16px; color: #78716c }
.ui-popup { position: absolute; z-index: 40; top: calc(100% + 6px); left: 0; right: 0; padding: 6px; border: 1px solid #e7e5e4; border-radius: 12px; background: #fff; box-shadow: 0 18px 40px -16px rgba(28, 25, 23, .35) }
@media (prefers-reduced-motion: reduce) { [data-ui] * { transition: none !important } }`

export const TABS = `.ui-tabs { display: grid; gap: 20px }
.ui-tablist { display: flex; gap: 4px; border-bottom: 1px solid #e7e5e4; overflow-x: auto }
.ui-tab { font: inherit; font-weight: 600; padding: 10px 16px; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; background: none; color: #57534e; cursor: pointer; white-space: nowrap }
.ui-tab:hover { color: #1c1917 }
.ui-tab[aria-selected="true"] { color: #4f46e5; border-bottom-color: #4f46e5 }
.ui-tab:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; border-radius: 6px }
.ui-tabs--pills .ui-tablist { border-bottom: 0; gap: 8px }
.ui-tabs--pills .ui-tab { margin: 0; border: 0; border-radius: 999px; padding: 9px 18px }
.ui-tabs--pills .ui-tab[aria-selected="true"] { background: #4f46e5; color: #fff }
.ui-tabs--boxed .ui-tablist { width: fit-content; max-width: 100%; padding: 4px; border: 0; border-radius: 12px; background: #f5f5f4 }
.ui-tabs--boxed .ui-tab { margin: 0; border: 0; border-radius: 9px }
.ui-tabs--boxed .ui-tab[aria-selected="true"] { background: #fff; color: #1c1917; box-shadow: 0 1px 3px rgba(28, 25, 23, .2) }
.ui-tabs--side { grid-template-columns: 200px 1fr; align-items: start }
.ui-tabs--side .ui-tablist { flex-direction: column; border-bottom: 0; border-right: 1px solid #e7e5e4; gap: 2px; padding-right: 8px }
.ui-tabs--side .ui-tab { margin: 0; border: 0; border-radius: 8px; text-align: left }
.ui-tabs--side .ui-tab[aria-selected="true"] { background: #eef2ff }
@media (max-width: 640px) { .ui-tabs--side { grid-template-columns: 1fr } .ui-tabs--side .ui-tablist { flex-direction: row; border-right: 0; padding: 0 } }`

export const MENU = `.ui-menu { position: relative; display: inline-block }
.ui-menu > summary { display: inline-flex; align-items: center; gap: 10px; list-style: none; cursor: pointer; padding: 10px 16px; border: 1px solid #d6d3d1; border-radius: 10px; background: #fff; font-weight: 600; color: #1c1917 }
.ui-menu > summary::-webkit-details-marker { display: none }
.ui-menu > summary::after { content: ""; width: 7px; height: 7px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg) translateY(-2px) }
.ui-menu[open] > summary { border-color: #4f46e5; box-shadow: 0 0 0 3px #e0e7ff }
.ui-menu-panel { position: absolute; z-index: 40; top: calc(100% + 6px); left: 0; display: grid; min-width: 210px; padding: 6px; border: 1px solid #e7e5e4; border-radius: 12px; background: #fff; box-shadow: 0 18px 40px -16px rgba(28, 25, 23, .35) }
.ui-menu-panel a { padding: 9px 12px; border-radius: 8px; color: #1c1917; font-size: 15px; text-decoration: none }
.ui-menu-panel a:hover { background: #f5f5f4 }
.ui-menu-panel .ui-danger { color: #b91c1c }
.ui-menu-sep { margin: 6px 0; border: 0; border-top: 1px solid #e7e5e4 }`

export const TABLE = `.ui-table-wrap { overflow-x: auto; border: 1px solid #e7e5e4; border-radius: 14px; background: #fff }
.ui-table { width: 100%; border-collapse: collapse; font-size: 15px; text-align: left }
.ui-table th { padding: 12px 16px; border-bottom: 1px solid #e7e5e4; background: #fafaf9; color: #57534e; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap }
.ui-table td { padding: 14px 16px; border-bottom: 1px solid #f0efed; color: #1c1917 }
.ui-table tbody tr:last-child td { border-bottom: 0 }
.ui-table--hover tbody tr:hover { background: #fafaf9 }
.ui-table--striped tbody tr:nth-child(even) { background: #fafaf9 }
.ui-table--compact th, .ui-table--compact td { padding: 8px 12px }
.ui-table th[data-ui-sort] { cursor: pointer; user-select: none }
.ui-table th[data-ui-sort]::after { content: "\\2195"; margin-left: 6px; opacity: .4 }
.ui-table th[aria-sort="ascending"]::after { content: "\\2191"; opacity: 1; color: #4f46e5 }
.ui-table th[aria-sort="descending"]::after { content: "\\2193"; opacity: 1; color: #4f46e5 }
.ui-table tr[hidden] { display: none !important }
.ui-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700 }
.ui-badge--ok { background: #dcfce7; color: #166534 }
.ui-badge--wait { background: #fef3c7; color: #92400e }
.ui-badge--off { background: #f5f5f4; color: #57534e }
.ui-table a { color: #4f46e5; font-weight: 600; text-decoration: none }`
