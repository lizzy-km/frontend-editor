import { widget } from '../site'

const ANIM = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'

const SETTINGS = ['switch-setting', 'switch-setting', 'switch-setting'] as const
const TEXTS = [
  ['Weekly summary', 'A short email every Monday with what happened.'],
  ['Reminders before due dates', 'Nudge owners one day before a task is late.'],
  ['Allow members to invite others', 'Turn off to keep invitations for admins only.'],
]

/** One setting row: the editor's switch block with this site's words. */
const setting = (index: number) => widget(SETTINGS[index]!)
  .replace('Weekly summary', TEXTS[index]![0]!).replace('A short email every Monday with what happened.', TEXTS[index]![1]!)
  .replace('name="summary"', `name="setting${index + 1}"`)

/** The admin-only page: the members table and workspace settings. */
export const ADMIN = `<section class="mb-sec" style="padding-top:40px"><div class="mb-wrap">`
  + `<div class="mb-welcome" ${ANIM}><div><h1>Admin</h1><p>People and settings for your workspace. Only admins see this page.</p></div><a class="mb-btn" href="/dashboard">Back to dashboard</a></div>`
  + `<div class="mb-card" style="margin-top:24px" ${ANIM}><h2 style="font-size:24px">Members</h2><p>Everyone with access to the workspace.</p>${widget('table-team')}</div>`
  + `<div class="mb-card" style="margin-top:24px" ${ANIM}><h2 style="font-size:24px">Settings</h2>${[0, 1, 2].map(setting).join('')}</div>`
  + '</div></section>'
