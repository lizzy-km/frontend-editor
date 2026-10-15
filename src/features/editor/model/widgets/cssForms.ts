export const FIELD = `.ui-field { display: grid; gap: 6px; max-width: 420px }
.ui-field textarea.ui-input { min-height: 110px; resize: vertical }
.ui-count { justify-self: end; font-size: 12px; color: #78716c }
.ui-field:has(.ui-input:user-invalid) .ui-input { border-color: #dc2626; box-shadow: 0 0 0 3px #fee2e2 }
.ui-stepper { display: flex; align-items: stretch }
.ui-stepper .ui-input { border-radius: 0; text-align: center; -moz-appearance: textfield }
.ui-stepper .ui-input::-webkit-inner-spin-button { display: none }
.ui-stepper button { flex: none; width: 44px; border: 1px solid #d6d3d1; background: #fafaf9; font-size: 20px; line-height: 1; color: #1c1917; cursor: pointer }
.ui-stepper button:first-child { border-radius: 10px 0 0 10px; border-right: 0 }
.ui-stepper button:last-child { border-radius: 0 10px 10px 0; border-left: 0 }
.ui-stepper button:hover { background: #f0efed }`

export const SWITCH = `.ui-switch-row { display: inline-flex; align-items: center; gap: 12px; cursor: pointer; font-weight: 500; color: #1c1917 }
.ui-switch { appearance: none; -webkit-appearance: none; flex: none; position: relative; width: 44px; height: 26px; margin: 0; border-radius: 999px; background: #d6d3d1; cursor: pointer; transition: background .15s }
.ui-switch::before { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(28, 25, 23, .3); transition: transform .15s }
.ui-switch:checked { background: #4f46e5 }
.ui-switch:checked::before { transform: translateX(18px) }
.ui-switch:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px }
.ui-switch:disabled { opacity: .5; cursor: not-allowed }
.ui-setting { display: flex; align-items: center; justify-content: space-between; gap: 24px; max-width: 520px; padding: 16px 18px; border: 1px solid #e7e5e4; border-radius: 14px; background: #fff; cursor: pointer }
.ui-setting strong { display: block; color: #1c1917 }
.ui-setting small { color: #78716c }`

export const SELECT = `.ui-select { position: relative; display: grid; gap: 6px; max-width: 360px }
.ui-select-trigger { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 11px 14px; border: 1px solid #d6d3d1; border-radius: 10px; background: #fff; font: inherit; color: #1c1917; text-align: left; cursor: pointer }
.ui-select-trigger:focus-visible, .ui-select-trigger[aria-expanded="true"] { outline: 0; border-color: #4f46e5; box-shadow: 0 0 0 3px #e0e7ff }
[data-ui-value][data-empty] { color: #78716c }
.ui-options { display: grid; max-height: 240px; margin: 0; padding: 0; overflow: auto; list-style: none }
.ui-option { padding: 9px 12px; border-radius: 8px; cursor: pointer }
.ui-option:hover, .ui-option:focus { outline: 0; background: #f5f5f4 }
.ui-option[aria-selected="true"] { background: #eef2ff; color: #4338ca; font-weight: 600 }
.ui-select .ui-search { width: 100%; box-sizing: border-box; margin-bottom: 6px; padding: 9px 12px; border: 1px solid #e7e5e4; border-radius: 8px; font: inherit }
.ui-empty { padding: 10px 12px; color: #78716c }`

export const DATE = `.ui-date { position: relative; display: grid; gap: 6px; max-width: 320px }
.ui-date .ui-popup { right: auto; width: 308px; padding: 14px }
.ui-cal { display: grid; gap: 10px; width: 280px }
.ui-cal--card { padding: 16px; border: 1px solid #e7e5e4; border-radius: 16px; background: #fff; box-shadow: 0 18px 40px -24px rgba(28, 25, 23, .35) }
.ui-cal-head { display: flex; align-items: center; justify-content: space-between }
.ui-cal-head strong { font-size: 15px; color: #1c1917 }
.ui-cal-nav { width: 32px; height: 32px; border: 0; border-radius: 8px; background: #f5f5f4; font-size: 18px; line-height: 1; color: #1c1917; cursor: pointer }
.ui-cal-nav:hover { background: #e7e5e4 }
.ui-cal-week, .ui-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center }
.ui-cal-week span { padding: 4px 0; font-size: 12px; font-weight: 600; color: #78716c }
.ui-day { position: relative; aspect-ratio: 1; padding: 0; border: 0; border-radius: 10px; background: none; font: inherit; font-size: 14px; color: #1c1917; cursor: pointer }
.ui-day:hover:not(:disabled) { background: #f5f5f4 }
.ui-day[data-out] { color: #a8a29e }
.ui-day[data-today] { font-weight: 800; color: #4f46e5; box-shadow: inset 0 0 0 1.5px #c7d2fe }
.ui-day[aria-selected="true"] { background: #4f46e5; color: #fff; box-shadow: none }
.ui-day[data-mark]::after { content: ""; position: absolute; left: 50%; bottom: 5px; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%; background: #f59e0b }
.ui-day:disabled { opacity: .35; cursor: not-allowed }
.ui-day:focus-visible { outline: 2px solid #4f46e5; outline-offset: 1px }
.ui-cal-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; color: #57534e }
.ui-cal-foot button { border: 0; background: none; font: inherit; font-weight: 600; color: #4f46e5; cursor: pointer }`

export const SEARCH = `.ui-search-bar { max-width: 460px }
.ui-search-bar .ui-input { border-radius: 999px; padding-right: 74px }
.ui-search-bar input:placeholder-shown ~ [data-ui-clear] { display: none }
.ui-results { margin: 0; font-size: 14px; color: #78716c }`

export const FILTER = `.ui-filter { display: flex; flex-wrap: wrap; align-items: center; gap: 8px }
.ui-chip { padding: 8px 16px; border: 1px solid #d6d3d1; border-radius: 999px; background: #fff; font: inherit; font-weight: 600; font-size: 14px; color: #1c1917; cursor: pointer }
.ui-chip:hover { background: #f5f5f4 }
.ui-chip[aria-pressed="true"] { border-color: #4f46e5; background: #4f46e5; color: #fff }
.ui-filter-box { display: grid; gap: 10px; max-width: 280px; padding: 18px; border: 1px solid #e7e5e4; border-radius: 14px; background: #fff }
.ui-filter-box strong { color: #1c1917 }
.ui-check { display: flex; align-items: center; gap: 10px; font-size: 15px; color: #1c1917; cursor: pointer }
.ui-check input { width: 18px; height: 18px; accent-color: #4f46e5 }
.ui-filter select.ui-input { width: auto; min-width: 180px }
[data-ui-filterable] > [hidden], [data-ui-filterable] [hidden] { display: none !important }`
