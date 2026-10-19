/** Web font used by the whole site. */
export const LINKS = ['https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap']

const BASE = `:root { --mb-ink: #0f172a; --mb-soft: #475569; --mb-line: #e2e8f0; --mb-bg: #f8fafc; --mb-brand: #4f46e5; --mb-brand-dark: #4338ca; --mb-tint: #eef2ff; --mb-ok: #16a34a; --mb-radius: 16px }
* { box-sizing: border-box }
body { margin: 0; font-family: Inter, system-ui, sans-serif; color: var(--mb-ink); background: #fff; line-height: 1.6 }
h1, h2, h3 { line-height: 1.15; letter-spacing: -.02em; margin: 0 0 12px }
h1 { font-size: clamp(36px, 5.4vw, 60px); font-weight: 800 }
h2 { font-size: clamp(26px, 3.4vw, 38px); font-weight: 800 }
h3 { font-size: 19px; font-weight: 700 }
p { margin: 0 0 14px; color: var(--mb-soft) }
img { max-width: 100%; display: block }
a { color: var(--mb-brand) }
.mb-sec { padding: 84px 24px }
.mb-sec--tint { background: var(--mb-bg); border-block: 1px solid var(--mb-line) }
.mb-wrap { max-width: 1120px; margin: 0 auto }
.mb-narrow { max-width: 720px; margin: 0 auto }
.mb-center { text-align: center }
.mb-eyebrow { display: inline-block; padding: 4px 12px; border-radius: 999px; background: var(--mb-tint); color: var(--mb-brand-dark); font-size: 13px; font-weight: 700; margin-bottom: 16px }
.mb-lead { font-size: 19px; max-width: 620px; margin-inline: auto }
.mb-btn { display: inline-block; font: inherit; font-weight: 700; padding: 13px 24px; border-radius: 12px; border: 1px solid var(--mb-brand); background: var(--mb-brand); color: #fff; text-decoration: none; cursor: pointer }
.mb-btn:hover { background: var(--mb-brand-dark) }
.mb-btn--ghost { background: #fff; color: var(--mb-ink); border-color: var(--mb-line) }
.mb-btn--ghost:hover { background: var(--mb-bg) }
.mb-btn--danger { background: #b91c1c; border-color: #b91c1c }
.mb-btn--danger:hover { background: #991b1b }
.mb-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 28px }
.mb-grid { display: grid; gap: 24px; grid-template-columns: repeat(3, 1fr); margin-top: 44px }
.mb-grid--2 { grid-template-columns: repeat(2, 1fr) }
.mb-card { background: #fff; border: 1px solid var(--mb-line); border-radius: var(--mb-radius); padding: 28px; box-shadow: 0 1px 2px rgba(15, 23, 42, .04) }
.mb-card p:last-child { margin-bottom: 0 }
.mb-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: var(--mb-tint); font-size: 22px; margin-bottom: 16px }
.mb-hero { padding: 96px 24px 72px; background: radial-gradient(900px 400px at 50% -10%, #e0e7ff, transparent) }
.mb-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 52px; text-align: center }
.mb-stats strong { display: block; font-size: 32px; font-weight: 800; color: var(--mb-ink) }
.mb-person { display: flex; align-items: center; gap: 12px; margin-top: 18px }
.mb-person img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover }
.mb-person span { font-size: 14px; color: var(--mb-soft); line-height: 1.3 }
.mb-faq details { border-bottom: 1px solid var(--mb-line); padding: 18px 0 }
.mb-faq summary { font-weight: 700; cursor: pointer; font-size: 17px }
.mb-faq details p { margin: 10px 0 0 }
.mb-cta { background: var(--mb-ink); border-radius: 24px; padding: 56px 28px; text-align: center }
.mb-cta h2 { color: #fff }
.mb-cta p { color: #cbd5e1 }
.mb-price { font-size: 44px; font-weight: 800; letter-spacing: -.03em; color: var(--mb-ink) }
.mb-price small { font-size: 16px; font-weight: 500; color: var(--mb-soft) }
.mb-plan--hot { border: 2px solid var(--mb-brand); box-shadow: 0 20px 40px -24px rgba(79, 70, 229, .5) }
.mb-plan ul { list-style: none; padding: 0; margin: 18px 0 24px }
.mb-plan li { padding: 6px 0 6px 26px; position: relative; color: var(--mb-soft) }
.mb-plan li::before { content: "\\2713"; position: absolute; left: 0; color: var(--mb-ok); font-weight: 800 }
.mb-modal-box { max-width: 460px; margin: 0 auto; padding: 32px; border-radius: 20px; background: #fff; box-shadow: 0 30px 70px -20px rgba(0, 0, 0, .5) }
.mb-form { display: grid; gap: 12px; margin-top: 16px }
.mb-form input { font: inherit; padding: 12px 14px; border: 1px solid var(--mb-line); border-radius: 10px; width: 100% }
.mb-toggle { display: inline-flex; align-items: center; gap: 12px; font: inherit; font-weight: 600; padding: 8px 16px 8px 8px; border: 1px solid var(--mb-line); border-radius: 999px; background: #fff; cursor: pointer }
.mb-toggle i { width: 40px; height: 22px; border-radius: 999px; background: var(--mb-brand); position: relative }
.mb-toggle i::after { content: ""; position: absolute; top: 3px; right: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff }
.mb-log { list-style: none; padding: 0; margin: 40px 0 0; border-left: 2px solid var(--mb-line) }
.mb-log li { padding: 0 0 28px 24px; position: relative }
.mb-log li::before { content: ""; position: absolute; left: -7px; top: 6px; width: 12px; height: 12px; border-radius: 50%; background: var(--mb-brand) }
.mb-tag { display: inline-block; font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 999px; background: var(--mb-tint); color: var(--mb-brand-dark); margin-right: 8px }
.mb-dash { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; margin-top: 24px }
.mb-tools { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 16px }
.mb-welcome { display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between; background: var(--mb-tint); border-radius: var(--mb-radius); padding: 28px }
.mb-welcome h1 { font-size: 30px; margin: 0 }
.mb-welcome p { margin: 4px 0 0 }
.mb-danger { margin-top: 24px; border-color: #fecaca; background: #fef2f2 }
.mb-foot { background: var(--mb-ink); color: #cbd5e1; padding: 48px 24px; font-size: 14px }
.mb-foot a { color: #fff; margin-right: 18px; text-decoration: none }
.mb-foot p { color: #94a3b8; margin: 14px 0 0 }
@media (max-width: 1024px) { .mb-grid { grid-template-columns: repeat(2, 1fr) } .mb-dash { grid-template-columns: 1fr } .mb-stats { grid-template-columns: repeat(2, 1fr) } }
@media (max-width: 640px) { .mb-sec { padding: 56px 18px } .mb-hero { padding: 64px 18px 48px } .mb-grid, .mb-grid--2 { grid-template-columns: 1fr } .mb-cta { padding: 40px 20px } .mb-btn { width: 100%; text-align: center } .mb-welcome h1 { font-size: 24px } }`

/** The theme CSS of the whole site (variables, buttons, cards, pricing, dashboard looks). */
export const SITE_CSS = BASE

/** The footer shared by every page. */
export const FOOTER = `<footer class="mb-foot"><div class="mb-wrap"><strong style="color:#fff;font-size:18px">Tasklane</strong><p style="margin-top:6px">Plan the week, share the load, finish on time.</p><p><a href="/pricing">Pricing</a><a href="/features">What is new</a><a href="/login">Log in</a><a href="/register">Sign up</a></p><p>&copy; 2026 Tasklane. All rights reserved.</p></div></footer>`
