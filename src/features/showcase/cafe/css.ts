/** Fonts for the site: a warm serif for headings and a clean sans for text. */
export const CAFE_LINKS = ['https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&display=swap']

/** The address of an Unsplash photo at a given width. */
export const PHOTO = (id: string, width = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

/** Pictures used around the site (all Unsplash photos). */
export const PICS = {
  croissant: '1555507036-ab1f4038808a', bread: '1509440159596-0249088772ff', lattes: '1495474472287-4d71bcdd2085', brunch: '1504754524776-8f4f37790ca0',
  bowl: '1546069901-ba9599a7e63c', pizza: '1565299624946-b28f40a0ae38', pancakes: '1567620905732-2d1ec7ab7445', donuts: '1551024601-bec78aea704b',
  plated: '1414235077428-338989a2e8c0', interior: '1555396273-367ea4eb4db5', dining: '1517248135467-4c7edcad34c4', sandwich: '1528735602780-2552fd46c7af',
  eggToast: '1482049016688-2d3e1b311543', pour: '1541167760496-1628856ab772', street: '1559925393-8be0ec4767c8', salad: '1511690743698-d9d85f2fbf38',
  blueberry: '1506084868230-bb9d95c24759', burger: '1572802419224-296b0aeee0d9', veg: '1490645935967-10de6ba17061', frenchToast: '1484723091739-30a097e8f929', platter: '1512621776951-a57141f2eefd',
}

/** The theme: colours, type, buttons, cards, forms, and phone / tablet rules. */
export const CAFE_CSS = `:root { --cafe-cream: #fbf6ee; --cafe-paper: #fffdf9; --cafe-ink: #2b1d14; --cafe-soft: #6b5a4c; --cafe-maple: #b4501d; --cafe-maple-dark: #8f3d13; --cafe-rye: #e9dcc7; --cafe-line: #eadfce }
html { scroll-behavior: smooth }
body { margin: 0; background: var(--cafe-cream); color: var(--cafe-ink); font-family: Inter, system-ui, sans-serif; line-height: 1.6; -webkit-font-smoothing: antialiased }
h1, h2, h3, .cafe-serif { font-family: Fraunces, Georgia, serif; font-weight: 700; line-height: 1.15; letter-spacing: -.01em; margin: 0 }
p { margin: 0 }
body .lay-top { background: var(--cafe-paper); color: var(--cafe-ink); border-bottom: 1px solid var(--cafe-line) }
body .lay-brand { font-family: Fraunces, Georgia, serif; font-size: 24px; color: var(--cafe-maple) }
body .lay-menu a.active, body .lay-menu a[aria-current="page"] { background: var(--cafe-rye) }
.cafe-wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px }
.cafe-section { padding: 80px 0 }
.cafe-section--tint { background: var(--cafe-rye) }
.cafe-eyebrow { display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--cafe-maple); margin-bottom: 10px }
.cafe-title { font-size: 40px; margin-bottom: 12px }
.cafe-lead { font-size: 18px; color: var(--cafe-soft); max-width: 620px }
.cafe-center { text-align: center }
.cafe-center .cafe-lead { margin: 0 auto }
.cafe-btn { display: inline-block; font: inherit; font-weight: 700; padding: 14px 26px; border: 2px solid var(--cafe-maple); border-radius: 999px; background: var(--cafe-maple); color: #fff; text-decoration: none; cursor: pointer; transition: background .2s }
.cafe-btn:hover { background: var(--cafe-maple-dark); border-color: var(--cafe-maple-dark) }
.cafe-btn--ghost { background: transparent; color: var(--cafe-maple) }
.cafe-btn--ghost:hover { color: #fff }
.cafe-btn--light { background: #fff; border-color: #fff; color: var(--cafe-ink) }
.cafe-btn--light:hover { background: var(--cafe-rye); border-color: var(--cafe-rye); color: var(--cafe-ink) }
.cafe-hero { position: relative; display: grid; align-items: center; min-height: 600px; color: #fff; overflow: hidden }
.cafe-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover }
.cafe-hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(30, 18, 10, .82), rgba(30, 18, 10, .35)) }
.cafe-hero .cafe-wrap { position: relative; z-index: 1; width: 100%; box-sizing: border-box }
.cafe-hero h1 { font-size: 64px; max-width: 640px; margin-bottom: 18px }
.cafe-hero p { font-size: 20px; max-width: 520px; margin-bottom: 30px; opacity: .92 }
.cafe-hero .cafe-eyebrow { color: #f3c79b }
.cafe-row { display: flex; gap: 14px; flex-wrap: wrap }
.cafe-grid { display: grid; gap: 28px; grid-template-columns: repeat(3, 1fr); margin-top: 40px }
.cafe-card { background: var(--cafe-paper); border: 1px solid var(--cafe-line); border-radius: 20px; overflow: hidden; box-shadow: 0 14px 30px -22px rgba(43, 29, 20, .5) }
.cafe-card img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover }
.cafe-card-body { padding: 20px 22px 24px }
.cafe-card h3 { font-size: 21px; margin-bottom: 6px }
.cafe-card p { color: var(--cafe-soft); font-size: 15px }
.cafe-tag { display: inline-block; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: var(--cafe-rye); color: var(--cafe-maple-dark); margin-bottom: 10px }
.cafe-price { font-family: Fraunces, Georgia, serif; font-size: 20px; font-weight: 700; color: var(--cafe-maple) }
.cafe-split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center }
.cafe-split img { width: 100%; border-radius: 24px; aspect-ratio: 5 / 4; object-fit: cover; display: block }
.cafe-split p + p { margin-top: 14px }
.cafe-quote p { font-size: 16px; color: var(--cafe-ink) }
.cafe-quote strong { display: block; margin-top: 14px; font-size: 14px; color: var(--cafe-soft) }
.cafe-stars { color: #d98a1f; letter-spacing: 3px; margin-bottom: 10px }
.cafe-bar { display: grid; gap: 14px; grid-template-columns: 1fr auto; align-items: end; margin: 32px 0 8px }
.cafe-menu-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; margin-top: 24px }
.cafe-menu-list .cafe-card { cursor: pointer; transition: transform .2s }
.cafe-menu-list .cafe-card:hover { transform: translateY(-4px) }
.cafe-menu-list [hidden] { display: none }
.cafe-dish { display: flex; justify-content: space-between; align-items: baseline; gap: 12px }
.cafe-popup { padding: 40px 20px; background: rgba(43, 29, 20, .6) }
.cafe-popup-box { max-width: 520px; margin: 0 auto; background: var(--cafe-paper); border-radius: 22px; overflow: hidden; box-shadow: 0 30px 70px -24px rgba(0, 0, 0, .6) }
.cafe-popup-box img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover }
.cafe-popup-body { padding: 24px 26px 28px; display: grid; gap: 12px }
.cafe-panel { background: var(--cafe-paper); border: 1px solid var(--cafe-line); border-radius: 24px; padding: 32px }
.cafe-form { display: grid; gap: 18px; grid-template-columns: 1fr 1fr }
.cafe-form > * { min-width: 0 }
.cafe-form .cafe-full { grid-column: 1 / -1 }
.cafe-form label { display: grid; gap: 6px; font-size: 14px; font-weight: 600 }
.cafe-form input:not([type="checkbox"]), .cafe-form textarea { font: inherit; font-weight: 400; padding: 12px 14px; border: 1px solid #d9c9b2; border-radius: 12px; background: #fff; color: var(--cafe-ink) }
.cafe-form button[type="submit"] { justify-self: start }
.cafe-hours td, .cafe-hours th { padding: 12px 16px }
.cafe-footer { background: #2b1d14; color: #eadfce; padding: 56px 24px 32px }
.cafe-footer a { color: #f3c79b; text-decoration: none }
.cafe-footer-grid { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px }
.cafe-footer h3 { color: #fff; font-size: 20px; margin-bottom: 10px }
.cafe-footer small { display: block; max-width: 1120px; margin: 40px auto 0; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, .15); opacity: .7 }
@media (max-width: 1024px) {
  .cafe-hero h1 { font-size: 52px }
  .cafe-grid { grid-template-columns: repeat(2, 1fr) }
  .cafe-split { gap: 36px }
  .cafe-section { padding: 64px 0 }
}
@media (max-width: 640px) {
  .cafe-hero { min-height: 520px }
  .cafe-hero h1 { font-size: 38px }
  .cafe-hero p { font-size: 17px }
  .cafe-title { font-size: 30px }
  .cafe-grid, .cafe-split, .cafe-form, .cafe-bar, .cafe-footer-grid { grid-template-columns: 1fr }
  .cafe-section { padding: 48px 0 }
  .cafe-panel { padding: 22px }
  .cafe-hours td, .cafe-hours th { padding: 10px 8px }
}`
