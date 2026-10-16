import { absolute } from './headTags.ts'

/** Structured data (schema.org) that helps search engines understand the app and its guide. No imports: the build reads this file too. */

export const organizationLd = (siteUrl: string) => ({
  '@context': 'https://schema.org', '@type': 'Organization', name: 'Tweak',
  ...(siteUrl ? { url: siteUrl, logo: absolute(siteUrl, '/icon-512.png') } : {}),
})

export const websiteLd = (siteUrl: string) => ({
  '@context': 'https://schema.org', '@type': 'WebSite', name: 'Tweak',
  description: 'Build websites by clicking, no code.',
  ...(siteUrl ? { url: siteUrl } : {}),
})

/** The product itself: a free web app people use to build and edit websites. */
export const softwareLd = (siteUrl: string) => ({
  '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Tweak',
  applicationCategory: 'DesignApplication', operatingSystem: 'Any (web browser)',
  description: 'A website builder for people who don’t code: paste an AI’s page, change it by clicking, then share it or download it as a web page, a .zip or a React project.',
  featureList: ['Edit by clicking', 'Pages, menus and layouts', 'Forms with checks', 'Data lists, tables, search and filters', 'Sign-in and roles', 'Pop-ups, tabs and a calendar', 'Download HTML or a React project'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  ...(siteUrl ? { url: siteUrl } : {}),
})

/** The trail "Home › Guide › Full guide". Items are [name, path]. */
export const breadcrumbLd = (siteUrl: string, items: [name: string, path: string][]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, ...(siteUrl ? { item: absolute(siteUrl, path) } : {}) })),
})

/** A how-to with numbered steps (a recipe in the guide). */
export const howToLd = (name: string, description: string, steps: string[]) => ({
  '@context': 'https://schema.org', '@type': 'HowTo', name, description,
  step: steps.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, text })),
})

/** Questions and answers shown on a page. */
export const faqLd = (items: [question: string, answer: string][]) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: items.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
})
