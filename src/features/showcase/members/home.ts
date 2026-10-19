const ANIM = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=160&q=80`

const FEATURES = [
  ['\u{1F4CB}', 'One shared board', 'Every task, owner and due date in one calm view, so nobody has to ask what is next.'],
  ['\u{1F4C5}', 'A calendar that fills itself', 'Due dates land on the team calendar the moment you set them.'],
  ['\u{1F50D}', 'Find anything fast', 'Search and filter by status or owner. Answers in a keystroke, not a meeting.'],
  ['\u{1F465}', 'Roles that make sense', 'Members plan and update. Admins manage people, plans and settings.'],
  ['\u{1F514}', 'Gentle reminders', 'A short nudge before work is late, never a flood of notifications.'],
  ['\u{1F512}', 'Private by default', 'Your workspace is only open to the people you invite.'],
]

const PEOPLE = [
  ['1494790108377-be9c29b29330', 'Priya N.', 'Operations lead', 'We replaced three spreadsheets and a weekly status meeting. Mondays are finally quiet.'],
  ['1500530855697-b586d89ba3ee', 'Daniel R.', 'Studio owner', 'My team of eight was planning in minutes on day one. Nobody needed training.'],
  ['1509440159596-0249088772ff', 'Hannah L.', 'Product manager', 'The calendar view alone is worth it. I see the whole month at a glance.'],
]

const QUESTIONS = [
  ['Is there a free plan?', 'Yes. Free works for up to three people and unlimited tasks. You only pay when your team grows.'],
  ['Can I move my tasks from a spreadsheet?', 'Yes. Paste your list or upload a file and Tasklane turns each row into a task.'],
  ['Who can see my workspace?', 'Only people you invite. Admins decide who can plan and who can change settings.'],
  ['Can I cancel any time?', 'Yes. Cancel from your dashboard in two clicks and keep access until the end of the period.'],
]

const card = ([icon, title, text]: string[]) => `<div class="mb-card"><div class="mb-icon">${icon}</div><h3>${title}</h3><p>${text}</p></div>`
const quote = ([id, name, role, text]: string[]) => `<figure class="mb-card" style="margin:0"><blockquote style="margin:0"><p style="color:var(--mb-ink);font-size:17px">&ldquo;${text}&rdquo;</p></blockquote><figcaption class="mb-person"><img src="${photo(id!)}" alt="Portrait of ${name}" width="44" height="44"><span><strong style="color:var(--mb-ink)">${name}</strong><br>${role}</span></figcaption></figure>`
const faq = ([q, a]: string[]) => `<details><summary>${q}</summary><p>${a}</p></details>`

const HERO = `<section class="mb-hero mb-center"><div class="mb-wrap mb-narrow" ${ANIM}><span class="mb-eyebrow">Task planning for small teams</span><h1>Plan the week. Share the load. Finish on time.</h1><p class="mb-lead">Tasklane gives your team one clear place for tasks, owners and deadlines, with nothing to set up and nothing to learn.</p>`
  + '<div class="mb-row"><a class="mb-btn" href="/register" data-fe-show="signed-out">Start free</a><a class="mb-btn" href="/dashboard" data-fe-show="signed-in">Go to dashboard</a><a class="mb-btn mb-btn--ghost" href="/pricing">See pricing</a></div>'
  + '<p style="margin-top:18px;font-size:14px">Free for up to three people. No card needed.</p></div></section>'

const STATS = `<section class="mb-sec" style="padding-top:24px"><div class="mb-wrap"><div class="mb-stats" ${ANIM}><div><strong>12,000+</strong><p>teams plan here</p></div><div><strong>2.4M</strong><p>tasks finished</p></div><div><strong>4.8 / 5</strong><p>average rating</p></div><div><strong>99.9%</strong><p>uptime last year</p></div></div></div></section>`

const MODAL = '<div data-fe-modal="signup" style="padding:40px 20px;background:rgba(15,23,42,.6)"><div class="mb-modal-box"><h2 style="font-size:28px">Start your free workspace</h2><p>Tell us where to send your invite. It takes ten seconds.</p>'
  + '<form class="mb-form" data-fe-submit="send" data-fe-success="Thank you! Check your inbox for your invite."><input type="text" name="name" placeholder="Your name" aria-label="Your name" required><input type="email" name="email" placeholder="Work email" aria-label="Work email" required><button type="submit" class="mb-btn">Send my invite</button></form>'
  + '<button type="button" class="mb-btn mb-btn--ghost" data-fe-close style="margin-top:12px;width:100%">Maybe later</button></div></div>'

const CTA = `<section class="mb-sec"><div class="mb-wrap"><div class="mb-cta" ${ANIM}><h2>Give your team a calmer week</h2><p class="mb-lead">Join thousands of teams that plan with Tasklane. Your first workspace is free.</p><div class="mb-row"><button type="button" class="mb-btn" data-fe-open="signup" style="background:#fff;color:var(--mb-ink)">Start free</button><a class="mb-btn mb-btn--ghost" href="/features">See what is new</a></div></div></div></section>${MODAL}`

/** The home page: hero, numbers, feature grid, praise, questions and the sign-up pop-up. */
export const HOME = HERO + STATS
  + `<section class="mb-sec mb-sec--tint"><div class="mb-wrap"><div class="mb-center" ${ANIM}><h2>Everything a team needs, nothing it does not</h2><p class="mb-lead">Built for people who would rather finish work than manage a tool.</p></div><div class="mb-grid" ${ANIM}>${FEATURES.map(card).join('')}</div></div></section>`
  + `<section class="mb-sec"><div class="mb-wrap"><div class="mb-center" ${ANIM}><h2>Loved by busy teams</h2></div><div class="mb-grid" ${ANIM}>${PEOPLE.map(quote).join('')}</div></div></section>`
  + `<section class="mb-sec mb-sec--tint"><div class="mb-narrow mb-faq" ${ANIM}><h2 class="mb-center">Questions, answered</h2>${QUESTIONS.map(faq).join('')}</div></section>`
  + CTA
