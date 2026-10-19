const ANIM = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'

type Plan = { name: string; blurb: string; monthly: string; yearly: string; items: string[]; hot?: boolean; cta: string }

const PLANS: Plan[] = [
  { name: 'Free', blurb: 'For a small crew getting started.', monthly: '$0', yearly: '$0', items: ['Up to 3 people', 'Unlimited tasks', 'Team calendar'], cta: 'Start free' },
  { name: 'Team', blurb: 'For teams that plan together every week.', monthly: '$9', yearly: '$7', items: ['Up to 25 people', 'Search and filters', 'Reminders', 'Priority email help'], hot: true, cta: 'Start free' },
  { name: 'Business', blurb: 'For companies that need more control.', monthly: '$19', yearly: '$15', items: ['Unlimited people', 'Roles and admin tools', 'Activity history', 'Phone support'], cta: 'Start free' },
]

const plan = (item: Plan, price: string, per: string) => `<div class="mb-card mb-plan${item.hot ? ' mb-plan--hot' : ''}"><h3>${item.name}${item.hot ? ' <span class="mb-tag">Most popular</span>' : ''}</h3><p>${item.blurb}</p><div class="mb-price">${price}<small> ${per}</small></div><ul>${item.items.map((text) => `<li>${text}</li>`).join('')}</ul><a class="mb-btn${item.hot ? '' : ' mb-btn--ghost'}" href="/register" style="width:100%;text-align:center">${item.cta}</a></div>`

const panel = (id: string, yearly: boolean, hidden: boolean) =>
  `<div role="tabpanel" class="ui-panel" data-ui-panel="${id}"${hidden ? ' hidden' : ''}><div class="mb-grid">${PLANS.map((item) => plan(item, yearly ? item.yearly : item.monthly, yearly ? 'per person / month, billed yearly' : 'per person / month')).join('')}</div></div>`

const TABS = '<div data-ui="tabs" class="ui-tabs ui-tabs--boxed"><div role="tablist" class="ui-tablist" style="justify-content:center"><button type="button" role="tab" class="ui-tab" data-ui-tab="monthly" aria-selected="true">Monthly</button><button type="button" role="tab" class="ui-tab" data-ui-tab="yearly" aria-selected="false" tabindex="-1">Yearly (save 20%)</button></div>'
  + `${panel('monthly', false, false)}${panel('yearly', true, true)}</div>`

const ROWS: [string, string, string, string][] = [
  ['People', '3', '25', 'Unlimited'], ['Tasks', 'Unlimited', 'Unlimited', 'Unlimited'], ['Team calendar', 'Yes', 'Yes', 'Yes'],
  ['Search and filters', 'Basic', 'Yes', 'Yes'], ['Reminders', 'No', 'Yes', 'Yes'], ['Roles and admin tools', 'No', 'No', 'Yes'], ['Help', 'Help articles', 'Email', 'Phone and email'],
]

const TABLE = `<div class="ui-table-wrap"><table data-ui="table" class="ui-table ui-table--striped ui-table--hover"><thead><tr>${['What you get', 'Free', 'Team', 'Business'].map((label) => `<th scope="col" data-ui-sort tabindex="0">${label}</th>`).join('')}</tr></thead><tbody>${ROWS.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`

/** The pricing page: monthly and yearly plan tabs and a comparison table. */
export const PRICING = `<section class="mb-sec mb-center"><div class="mb-wrap" ${ANIM}><span class="mb-eyebrow">Pricing</span><h1 style="font-size:clamp(32px,4.5vw,48px)">Simple prices that grow with your team</h1><p class="mb-lead">Start free. Upgrade when you need more people or more control. Cancel any time.</p><div style="margin-top:36px">${TABS}</div></div></section>`
  + `<section class="mb-sec mb-sec--tint"><div class="mb-wrap" ${ANIM}><h2 class="mb-center">Compare the plans</h2><div style="margin-top:32px">${TABLE}</div></div></section>`
  + `<section class="mb-sec"><div class="mb-narrow mb-center" ${ANIM}><h2>Not sure which plan fits?</h2><p class="mb-lead">Start on Free. You can move up or down at any time, and your tasks come with you.</p><div class="mb-row"><a class="mb-btn" href="/register" data-fe-show="signed-out">Create a free account</a><a class="mb-btn" href="/dashboard" data-fe-show="signed-in">Open my dashboard</a></div></div></section>`
