/** What a ready-made idea for a React project says about the app (Part 1 of the prompt). */
export type AppBriefParts = {
  /** What the app is, its name and its goal. */
  purpose: string
  /** The kinds of people who use it (visitors, members, admins…). */
  users: string
  /** The pages in menu order, each with its address and what is on it. */
  pages: string[]
  /** What the app must do (sign-in, protected pages, creating and editing things, search…). */
  features: string[]
  /** The things the app keeps: what they are called, their fields and how many sample ones. */
  data: string[]
  look: string
  fonts: string
  /** Names, prices, rules and other facts the AI should use. */
  details: string
}

/** Writes the brief the way every idea shows it, so each one has the same headings. */
export const appBrief = (parts: AppBriefParts): string => `- What the app is for: ${parts.purpose}
- Who will use it: ${parts.users}
- Language of the text: English
- Pages, in menu order:
${parts.pages.map((page, index) => `  ${index + 1}. ${page}`).join('\n')}
- Features it needs:
${parts.features.map((feature) => `  - ${feature}`).join('\n')}
- Data it works with:
${parts.data.map((item) => `  - ${item}`).join('\n')}
- Look and feel: ${parts.look}
- Fonts: ${parts.fonts}
- Details: ${parts.details}`

/** The headings every React idea has (the tests check them). */
export const APP_BRIEF_HEADINGS = ['What the app is for', 'Who will use it', 'Language of the text', 'Pages, in menu order', 'Features it needs', 'Data it works with', 'Look and feel', 'Fonts', 'Details']
