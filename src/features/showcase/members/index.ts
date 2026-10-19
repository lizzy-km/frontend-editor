import { buildSite } from '../site'
import type { Showcase } from '../types'
import { ADMIN } from './admin'
import { FOOTER, LINKS, SITE_CSS } from './css'
import { DASHBOARD } from './dashboard'
import { TASKS } from './data'
import { FEATURES_PAGE } from './features'
import { HOME } from './home'
import { PRICING } from './pricing'

/** Builds the Tasklane site: landing pages, sign-in pages, a members-only dashboard and an admin-only page. */
const build = () => buildSite({
  title: 'Tasklane', css: SITE_CSS, links: LINKS, home: HOME, footer: FOOTER, data: [TASKS], authPages: true,
  access: { roles: ['member', 'admin'], flags: ['beta'] },
  pages: [
    { title: 'Pricing', path: '/pricing', html: PRICING },
    { title: 'What is new', path: '/features', html: FEATURES_PAGE },
    { title: 'Dashboard', path: '/dashboard', html: DASHBOARD, access: { audience: 'signed-in', roles: [], flags: [] } },
    { title: 'Admin', path: '/admin', html: ADMIN, access: { audience: 'signed-in', roles: ['admin'], flags: [] } },
  ],
})

/** The members area example: a task-planning product with a public site and a signed-in area. */
export const membersShowcase: Showcase = {
  id: 'members', title: 'Members and SaaS',
  tagline: 'Tasklane, a team task planner with a landing site, pricing, sign-in pages and a members-only dashboard.',
  features: ['Sign-in pages', 'Members-only pages', 'Admin-only page', 'Beta switch', 'Pop-up sign-up', 'Search and filters', 'Ask before deleting'],
  requires: ['data-fe-show', 'data-fe-roles', 'data-fe-flags', 'data-fe-flag', 'data-fe-modal', 'data-fe-ask', 'data-fe-submit', 'data-ui-filterable', 'data-fe-animate'],
  build,
}
