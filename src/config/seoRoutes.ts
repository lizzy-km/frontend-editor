/**
 * What search engines and link previews should know about each screen. One list, used by the running app
 * (`shared/seo`) and by the build (`scripts/seo`), so the page head is the same for visitors and crawlers.
 * No imports on purpose: the build reads this file directly.
 *
 * Add a line for every new public screen. Titles stay under about 60 characters, descriptions 70–160.
 */
export type SeoRoute = {
  path: string
  title: string
  description: string
  /** false = "noindex": account, editor and sign-in screens. */
  index: boolean
  priority?: number
  changefreq?: 'weekly' | 'monthly' | 'yearly'
  /** Text for crawlers that don't run scripts (a <noscript> block, and the static copy of the page). */
  summary?: { heading: string; text: string; links?: [label: string, to: string][] }
}

export const SITE_NAME = 'Tweak'
export const DEFAULT_TITLE = 'Tweak — build websites by clicking, no code'
export const DEFAULT_DESCRIPTION = 'Build a real website just by clicking: pages, menus, forms, sign-in and live data in plain words. Start from AI code or a blank page, then share or download it.'

export const SEO_ROUTES: SeoRoute[] = [
  {
    path: '/', title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, index: true, priority: 1, changefreq: 'weekly',
    summary: {
      heading: 'Build a real website just by clicking.',
      text: 'Tweak is a website builder for people who don’t code. Paste the page an AI wrote, or start blank, then change words, pictures, colors, pages, menus, forms and data by clicking. Share a link or download a web page, a .zip or a React project.',
      links: [['Try it free', '/try'], ['Quick guide', '/guide'], ['Explore pages', '/gallery']],
    },
  },
  {
    path: '/try', title: 'Try Tweak free — edit a web page by clicking', index: true, priority: 0.9, changefreq: 'monthly',
    description: 'Paste the code from ChatGPT, Claude or Gemini, or start with an example page, and change it by clicking. No account needed to try.',
    summary: { heading: 'Try Tweak free', text: 'Paste the page an AI wrote (or start from an example) and change it by clicking. No account is needed to try it.', links: [['Home', '/'], ['Quick guide', '/guide']] },
  },
  {
    path: '/guide', title: 'Quick guide — how to use Tweak', index: true, priority: 0.8, changefreq: 'monthly',
    description: 'Start in five steps, then find the short answer to “how do I…?” for pages, menus, forms, data, pop-ups, tables and downloads.',
    summary: { heading: 'The quick guide', text: 'Five steps to your first site and a short answer for every feature of Tweak, each with a link to the details.', links: [['Full guide', '/guide/full'], ['Home', '/']] },
  },
  {
    path: '/guide/full', title: 'Full guide — every Tweak feature explained', index: true, priority: 0.8, changefreq: 'monthly',
    description: 'Step-by-step help with pictures: make pages and menus, forms, data lists, detail pages, sign-in, tabs, tables, search, pop-ups, and export a React project.',
    summary: { heading: 'The full guide', text: 'Every feature explained in plain words with the steps to follow, with pictures and a search box.', links: [['Quick guide', '/guide'], ['Home', '/']] },
  },
  {
    path: '/gallery', title: 'Explore pages made with Tweak', index: true, priority: 0.6, changefreq: 'weekly',
    description: 'Browse pages and sites other people built with Tweak, and make your own copy of one to start from.',
    summary: { heading: 'Explore pages', text: 'Pages and sites made with Tweak. Open one, or make your own copy to start from.', links: [['Try Tweak', '/try'], ['Home', '/']] },
  },
  {
    path: '/terms', title: 'Terms of Use — Tweak', index: true, priority: 0.3, changefreq: 'yearly',
    description: 'The rules for using Tweak: your account, what you own, what is not allowed, downloads, and what we are and are not responsible for.',
    summary: { heading: 'Terms of Use', text: 'The rules for using Tweak in plain words: you keep what you make, you are responsible for what you publish, and the Service is provided as it is.', links: [['Privacy Policy', '/privacy'], ['Home', '/']] },
  },
  {
    path: '/privacy', title: 'Privacy Policy — Tweak', index: true, priority: 0.3, changefreq: 'yearly',
    description: 'What personal data Tweak collects, why, who handles it, how long it is kept, and the choices and rights you have.',
    summary: { heading: 'Privacy Policy', text: 'What we collect, why, who else handles it, how long we keep it and what you can do about it, in plain words.', links: [['Terms of Use', '/terms'], ['Home', '/']] },
  },
  { path: '/login', title: 'Sign in — Tweak', description: 'Sign in to your Tweak account to open your saved pages.', index: false },
  { path: '/signup', title: 'Create a free account — Tweak', description: 'Create a free Tweak account to save your pages, share links and download your work.', index: false },
  { path: '/reset', title: 'Reset your password — Tweak', description: 'Get an email to choose a new Tweak password.', index: false },
  { path: '/projects', title: 'My pages — Tweak', description: 'Your saved Tweak pages.', index: false },
  { path: '/projects/new', title: 'New page — Tweak', description: 'Start a new Tweak page.', index: false },
]

/** Screens whose address has a changing part, or that only exist for signed-in people: never indexed. */
export const NOINDEX_PREFIXES = ['/edit/', '/p/', '/projects', '/plans', '/market']

/** The entry for an address (exact match), or null. */
export const seoRouteFor = (path: string): SeoRoute | null => SEO_ROUTES.find((route) => route.path === path.replace(/(.)\/+$/, '$1')) ?? null

/** The screens that go into the sitemap and get a static copy of the page. */
export const INDEXED_ROUTES = SEO_ROUTES.filter((route) => route.index)
