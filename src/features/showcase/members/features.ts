const ANIM = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'

const RELEASES = [
  ['October 2026', 'New', 'Team calendar', 'Every due date now appears on a shared monthly calendar.'],
  ['September 2026', 'Better', 'Faster search', 'Search finds tasks as you type, across titles and owners.'],
  ['August 2026', 'New', 'Roles', 'Invite admins and members and decide who can change settings.'],
  ['June 2026', 'Fixed', 'Invoice export', 'Exports now keep the right currency and the right dates.'],
]

const entry = ([month, tag, title, text]: string[]) => `<li><span class="mb-tag">${tag}</span><strong>${title}</strong> <span style="color:#64748b;font-size:14px">${month}</span><p style="margin-top:6px">${text}</p></li>`

const PREVIEW = '<div data-fe-flags="beta" class="mb-card" style="margin-top:28px;border-color:#a5b4fc;background:#eef2ff"><span class="mb-tag">Beta</span><h3 style="margin-top:8px">The new board</h3>'
  + '<p>Drag a task from To do to Doing to Done. Everyone sees the move right away, and the calendar updates with it.</p>'
  + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px">'
  + ['To do|Review onboarding emails', 'Doing|Fix the invoice export', 'Done|Update the pricing page'].map((text) => { const [lane, task] = text.split('|'); return `<div style="background:#fff;border:1px solid #c7d2fe;border-radius:12px;padding:14px"><small style="font-weight:700;color:#4338ca">${lane}</small><p style="margin:6px 0 0;color:#0f172a">${task}</p></div>` }).join('')
  + '</div></div>'

/** The what-is-new page: a beta switch (a flag), the beta preview that shows when it is on, and a change log. */
export const FEATURES_PAGE = `<section class="mb-sec"><div class="mb-narrow" ${ANIM}><span class="mb-eyebrow">What is new</span><h1 style="font-size:clamp(32px,4.5vw,48px)">Fresh from the workshop</h1><p class="mb-lead" style="margin-inline:0">We ship small improvements every month. Here is what changed, and a sneak peek at what is next.</p>`
  + '<button type="button" class="mb-toggle" data-fe-flag="beta" data-fe-flag-mode="toggle" style="margin-top:12px"><i aria-hidden="true"></i>Try the new board (beta)</button>'
  + `${PREVIEW}<ul class="mb-log">${RELEASES.map(entry).join('')}</ul></div></section>`
  + `<section class="mb-sec mb-sec--tint"><div class="mb-narrow mb-center" ${ANIM}><h2>Have an idea?</h2><p class="mb-lead">The best features start with a message from you. Log in and tell us what would help your team.</p><div class="mb-row"><a class="mb-btn" href="/login" data-fe-show="signed-out">Log in</a><a class="mb-btn" href="/dashboard" data-fe-show="signed-in">Go to dashboard</a></div></div></section>`
