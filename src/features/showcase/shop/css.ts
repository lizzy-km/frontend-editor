/** Web fonts for the whole shop (headings and text). */
export const SHOP_LINKS = ['https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap']

/** The theme of the whole site: colours, type, buttons, cards, forms and the rules for tablets (1024px) and phones (640px). */
export const SHOP_CSS = `
:root { --shop-bg: #faf6ef; --shop-card: #fff; --shop-ink: #2b2622; --shop-soft: #6b625a; --shop-line: #e9e1d4; --shop-accent: #b4491f; --shop-accent-dark: #8f3813; --shop-green: #2f4a3a; --shop-sand: #f1e9db; --shop-radius: 16px }
* { box-sizing: border-box }
body { margin: 0; background: var(--shop-bg); color: var(--shop-ink); font: 16px/1.6 Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased }
h1, h2, h3 { font-family: Fraunces, Georgia, serif; line-height: 1.15; margin: 0; letter-spacing: -.01em }
img { max-width: 100% }
a { color: inherit }
.shop-wrap { max-width: 1160px; margin: 0 auto; padding: 72px 24px }
.shop-wrap--tight { padding-top: 40px; padding-bottom: 40px }
.shop-eyebrow { margin: 0 0 12px; font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--shop-accent) }
.shop-title { font-size: 40px; margin-bottom: 12px }
.shop-lead { margin: 0; max-width: 620px; color: var(--shop-soft); font-size: 18px }
.shop-head { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 32px; flex-wrap: wrap }
.shop-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font: inherit; font-weight: 600; padding: 13px 24px; border: 1.5px solid var(--shop-accent); border-radius: 999px; background: var(--shop-accent); color: #fff; text-decoration: none; cursor: pointer; transition: background .2s, transform .2s }
.shop-btn:hover { background: var(--shop-accent-dark); transform: translateY(-1px) }
.shop-btn--ghost { background: transparent; color: var(--shop-ink); border-color: var(--shop-ink) }
.shop-btn--ghost:hover { background: var(--shop-ink); color: #fff }
.shop-btn--small { padding: 8px 16px; font-size: 14px }
.shop-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px }
.shop-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)) }
.shop-card { display: flex; flex-direction: column; background: var(--shop-card); border: 1px solid var(--shop-line); border-radius: var(--shop-radius); overflow: hidden; cursor: pointer; transition: box-shadow .25s, transform .25s }
.shop-card:hover { transform: translateY(-4px); box-shadow: 0 22px 40px -26px rgba(43, 38, 34, .5) }
.shop-card__pic { aspect-ratio: 1 / 1; background: var(--shop-sand) }
.shop-card__pic img { display: block; width: 100%; height: 100%; object-fit: cover }
.shop-card__body { display: flex; flex-direction: column; gap: 6px; padding: 16px 18px 18px; flex: 1 }
.shop-card__cat { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--shop-soft) }
.shop-card h3 { font-size: 18px }
.shop-card__price { margin: 0; font-weight: 700; font-size: 18px; color: var(--shop-accent) }
.shop-card__actions { display: flex; gap: 8px; margin-top: auto; padding-top: 10px; flex-wrap: wrap }
.shop-fav { font: inherit; font-size: 14px; font-weight: 600; padding: 8px 14px; border: 1.5px solid var(--shop-line); border-radius: 999px; background: #fff; cursor: pointer }
.shop-fav:hover { border-color: var(--shop-accent); color: var(--shop-accent) }
.shop-banner { margin: 0 0 20px; padding: 12px 18px; border-radius: 12px; background: #e6efe8; color: var(--shop-green); font-weight: 600 }
.shop-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-bottom: 32px }
.shop-tools > * { flex: 0 1 auto }
.shop-cats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 20px }
.shop-cat { position: relative; display: block; aspect-ratio: 4 / 5; border-radius: var(--shop-radius); overflow: hidden; text-decoration: none; color: #fff; background: var(--shop-green) }
.shop-cat img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .4s }
.shop-cat:hover img { transform: scale(1.06) }
.shop-cat h3 { position: absolute; left: 16px; bottom: 14px; z-index: 1; font-size: 22px; text-shadow: 0 2px 12px rgba(0, 0, 0, .5) }
.shop-cat::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0, 0, 0, .55), transparent 55%) }
.shop-benefits { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px }
.shop-benefit { padding: 24px; border-radius: var(--shop-radius); background: var(--shop-sand) }
.shop-benefit h3 { font-size: 19px; margin-bottom: 6px }
.shop-benefit p { margin: 0; color: var(--shop-soft); font-size: 15px }
.shop-band { background: var(--shop-green); color: #fff }
.shop-band .shop-lead { color: #d6e2d9 }
.shop-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 56px; align-items: center }
.shop-panel { padding: 32px; background: var(--shop-card); border: 1px solid var(--shop-line); border-radius: 20px; display: grid; gap: 16px }
.shop-field { display: grid; gap: 6px; font-size: 14px; font-weight: 600 }
.shop-input { font: inherit; font-weight: 400; padding: 12px 14px; border: 1.5px solid var(--shop-line); border-radius: 12px; background: #fff; color: var(--shop-ink); width: 100% }
.shop-input:focus { outline: 2px solid var(--shop-accent); outline-offset: 1px }
.shop-quick { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; width: 100%; max-width: 720px; margin: 0 auto; padding: 24px; border-radius: 20px; background: #fff; color: var(--shop-ink) }
.shop-note { padding: 14px 18px; border-radius: 12px; background: #fdf0d5; color: #6a4a07; font-size: 15px }
.shop-footer { background: #231f1c; color: #cfc6ba; padding: 48px 24px; font-size: 15px }
.shop-footer__in { max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 32px }
.shop-footer h3 { color: #fff; font-size: 18px; margin-bottom: 10px }
.shop-footer a { display: block; text-decoration: none; padding: 2px 0 }
.shop-footer a:hover { color: #fff }
@media (max-width: 1024px) {
  .shop-grid, .shop-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)) }
  .shop-cats { grid-template-columns: repeat(3, minmax(0, 1fr)) }
  .shop-benefits { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .shop-split { gap: 32px }
}
@media (max-width: 640px) {
  .shop-wrap { padding: 48px 16px }
  .shop-title { font-size: 30px }
  .shop-grid, .shop-grid--three { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px }
  .shop-cats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px }
  .shop-benefits, .shop-split, .shop-footer__in { grid-template-columns: 1fr }
  .shop-card__body { padding: 12px }
  .shop-card h3 { font-size: 16px }
  .shop-panel { padding: 20px }
  .shop-quick { grid-template-columns: 1fr }
}
`
