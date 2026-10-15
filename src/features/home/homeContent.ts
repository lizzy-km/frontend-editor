import type { IconName } from '@/shared/ui'

/** Words and facts on the home page. Keep them true to what the app does. */

export type Feature = { icon: IconName; title: string; text: string; tone: 'coral' | 'violet' | 'teal' | 'amber' | 'blue' | 'pink' }

export const FEATURES: Feature[] = [
  { icon: 'pencil', tone: 'coral', title: 'Click to change anything', text: 'Words, pictures, colors, sizes, spacing. Check how it looks on a computer, a tablet and a phone.' },
  { icon: 'layers', tone: 'violet', title: 'Real websites, many pages', text: 'Add pages, then a top bar, a side menu or both. Pick which pages are in the menu. Make one page for every product with a Detail page.' },
  { icon: 'lock', tone: 'teal', title: 'Sign-in and who sees what', text: 'Ready-made Log in, Sign up and Forgot password pages. Show or hide any part for visitors, members or admins, and test it with “Viewing as”.' },
  { icon: 'box', tone: 'amber', title: 'Your data, live', text: 'Show lists of products, posts or people, or one item on its own page. Paste JSON or connect your own API (with a key) and test it right here.' },
  { icon: 'check', tone: 'blue', title: 'Forms that check themselves', text: 'Contact and sign-up forms with rules you set per box: must be filled in, how long, “same as” for repeat password.' },
  { icon: 'sparkle', tone: 'pink', title: 'Pop-ups, questions, motion', text: 'Open a pop-up from any button, ask “Are you sure?” first, and make things glide in as visitors scroll.' },
  { icon: 'sun', tone: 'coral', title: 'One place for every color', text: 'See all the colors of your project and change one: it changes everywhere it is used, on every page and screen size.' },
  { icon: 'code', tone: 'violet', title: 'Code when you want it', text: 'Everything is plain HTML and CSS you can open. See and even edit the React code of each part, with a CodeMirror editor.' },
]

export const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'copy', title: 'Paste or start blank', text: 'Paste what ChatGPT, Claude or Gemini wrote, or start from an empty page. One page or a whole website.' },
  { icon: 'pencil', title: 'Click and shape it', text: 'Change what you see. Add pages, menus, forms and data from simple panels in plain words.' },
  { icon: 'download', title: 'Take it with you', text: 'Share a link, or download a web page, a .zip, or a full React project.' },
]

export const DOWNLOADS: { title: string; text: string }[] = [
  { title: 'A web page (.html)', text: 'One file that works anywhere.' },
  { title: 'A website (.zip)', text: 'One file per page, with shared styles.' },
  { title: 'A React project', text: 'TypeScript, one component per part, React Router or TanStack Router, forms with Zod, data with React Query.' },
]

export const AUDIENCE: { title: string; text: string }[] = [
  { title: 'Small businesses', text: 'A shop, a menu, a booking page, up and running without hiring a developer.' },
  { title: 'Creators', text: 'Portfolios, link pages and launch pages that look the way you imagined.' },
  { title: 'Students and makers', text: 'Learn how pages are built while you click: the code is always one tab away.' },
  { title: 'Teams and agencies', text: 'Turn an AI draft into a clean React starter, then hand it over.' },
]

export const AI_NAMES = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'v0', 'Lovable']
