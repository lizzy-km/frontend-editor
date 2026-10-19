/** Google font for the headings and the text. */
export const FONTS = ['https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Inter:wght@400;500;600&display=swap']

const BASE = `:root { --ag-ink: #0e0f12; --ag-paper: #f6f3ee; --ag-card: #ffffff; --ag-muted: #6b6a66; --ag-line: #e2ddd4; --ag-accent: #ff5b2e; --ag-accent-ink: #1b0a04; --ag-radius: 20px }
body { margin: 0; background: var(--ag-paper); color: var(--ag-ink); font-family: 'Inter', system-ui, sans-serif; font-size: 17px; line-height: 1.6; -webkit-font-smoothing: antialiased }
h1, h2, h3, h4 { font-family: 'Bricolage Grotesque', 'Inter', sans-serif; line-height: 1.05; letter-spacing: -.02em; margin: 0 }
h1 { font-size: clamp(46px, 8vw, 104px); font-weight: 800 }
h2 { font-size: clamp(32px, 4.6vw, 58px); font-weight: 800 }
h3 { font-size: 24px; font-weight: 800 }
p { margin: 0 }
img { max-width: 100% }
a { color: inherit }
body .lay-top { background: rgba(246, 243, 238, .9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--ag-line); color: var(--ag-ink); padding: 14px 32px }
body .lay-brand { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -.02em }
body .lay-brand::before { content: ''; display: inline-block; width: 12px; height: 12px; margin-right: 10px; border-radius: 50%; background: var(--ag-accent) }
body .lay-menu a { font-size: 15px; font-weight: 500; border-radius: 999px }
body .lay-menu a.active, body .lay-menu a[aria-current="page"] { background: var(--ag-ink); color: var(--ag-paper) }
.ag-wrap { max-width: 1160px; margin: 0 auto; padding: 0 32px }
.ag-section { padding: 112px 0 }
.ag-dark { background: var(--ag-ink); color: var(--ag-paper) }
.ag-dark .ag-muted { color: #a9a69e }
.ag-eyebrow { font-size: 13px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--ag-accent); margin-bottom: 18px }
.ag-muted { color: var(--ag-muted) }
.ag-lead { font-size: 21px; max-width: 620px; color: var(--ag-muted) }
.ag-btn { display: inline-block; padding: 15px 28px; border-radius: 999px; background: var(--ag-accent); color: var(--ag-accent-ink); font: inherit; font-weight: 600; text-decoration: none; border: 0; cursor: pointer; transition: transform .2s, box-shadow .2s }
.ag-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -8px rgba(255, 91, 46, .6) }
.ag-btn--ghost { background: transparent; color: inherit; border: 1.5px solid currentColor }
.ag-btn--ghost:hover { box-shadow: none; background: rgba(127, 127, 127, .14) }
.ag-row { display: flex; flex-wrap: wrap; gap: 14px; align-items: center }
.ag-head { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 48px; flex-wrap: wrap }
.ag-hero { position: relative; overflow: hidden; padding: 120px 0 130px }
.ag-hero h1 span { color: var(--ag-accent) }
.ag-orb { position: absolute; border-radius: 50%; filter: blur(2px); opacity: .9; animation: ag-float 9s ease-in-out infinite }
.ag-orb--a { width: 380px; height: 380px; right: -80px; top: 40px; background: radial-gradient(circle at 30% 30%, #ffb199, var(--ag-accent) 60%, #c43a12) }
.ag-orb--b { width: 150px; height: 150px; right: 300px; bottom: 30px; background: var(--ag-ink); animation-delay: -4s; animation-duration: 12s }
@keyframes ag-float { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(-24px, -30px) } }
@media (prefers-reduced-motion: reduce) { .ag-orb { animation: none } }
.ag-hero-inner { position: relative; z-index: 1; display: grid; gap: 32px }
.ag-grid { display: grid; gap: 28px }
.ag-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)) }
.ag-grid--4 { grid-template-columns: repeat(4, minmax(0, 1fr)) }
.ag-grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)) }
.ag-card { background: var(--ag-card); border: 1px solid var(--ag-line); border-radius: var(--ag-radius); padding: 32px; display: grid; gap: 14px; align-content: start }
.ag-card .ag-num { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; color: var(--ag-accent); font-size: 15px }
.ag-work-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px }
.ag-work-card { cursor: pointer; display: grid; gap: 14px; transition: transform .25s }
.ag-work-card:hover { transform: translateY(-6px) }
.ag-work-card img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: var(--ag-radius); background: var(--ag-line) }
.ag-work-card h3 { font-size: 22px }
.ag-work-card .ag-tag { font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ag-muted) }
.ag-stat b { display: block; font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(48px, 6vw, 80px); font-weight: 800; line-height: 1; color: var(--ag-accent) }
.ag-quote { background: var(--ag-card); color: var(--ag-ink); border-radius: var(--ag-radius); padding: 36px; display: grid; gap: 22px; align-content: space-between }
.ag-quote p { font-size: 20px; line-height: 1.45 }
.ag-quote small { color: var(--ag-muted); font-size: 15px }
.ag-cta { text-align: center; display: grid; justify-items: center; gap: 28px }
.ag-footer { background: var(--ag-ink); color: #a9a69e; padding: 56px 0; font-size: 15px }
.ag-footer .ag-wrap { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap }
.ag-footer a { color: var(--ag-paper); text-decoration: none }
body .ui-chip { background: transparent; border-color: var(--ag-ink); color: var(--ag-ink); font-family: inherit }
body .ui-chip:hover { background: rgba(14, 15, 18, .08) }
body .ui-chip[aria-pressed="true"] { background: var(--ag-ink); border-color: var(--ag-ink); color: var(--ag-paper) }
body .ui-tabs--pills .ui-tab[aria-selected="true"] { background: var(--ag-ink); color: var(--ag-paper) }
body .ui-tabs--pills .ui-tab { font-family: inherit; font-weight: 600 }
body .ui-table--striped tbody tr:nth-child(even) { background: rgba(14, 15, 18, .04) }
body .ui-input, body .ui-select-trigger { border-radius: 12px; font-family: inherit }
body .ui-input:focus, body .ui-select-trigger:focus-visible { outline: 2px solid var(--ag-accent); outline-offset: 1px }
@media (max-width: 1024px) {
  .ag-section { padding: 80px 0 }
  .ag-grid--4 { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .ag-grid--3, .ag-work-list { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .ag-orb--a { width: 260px; height: 260px; opacity: .55 }
  .ag-orb--b { display: none }
}
@media (max-width: 640px) {
  .ag-wrap { padding: 0 20px }
  .ag-section { padding: 64px 0 }
  .ag-hero { padding: 72px 0 80px }
  .ag-grid--4, .ag-grid--3, .ag-grid--2, .ag-work-list { grid-template-columns: minmax(0, 1fr) }
  .ag-card { padding: 24px }
  .ag-orb--a { right: -120px; top: -20px }
  .ag-btn { width: 100%; text-align: center; box-sizing: border-box }
  body .lay-top { padding: 12px 20px }
}`

/** The site's theme: colours, type and the shared looks, with responsive rules at 1024px and 640px. */
export const css = (): string => BASE
