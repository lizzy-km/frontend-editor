import { BIG_EVENT_PRESETS } from './presets/bigEvents'
import { BRAND_PRESETS } from './presets/brands'
import { BUSINESS_PRESETS } from './presets/business'
import { CELEBRATION_PRESETS } from './presets/celebrations'
import { COMMUNITY_PRESETS } from './presets/community'
import { RESUME_PRESET, WEDDING_PRESET } from './presets/personal'
import { CREATIVE_PORTFOLIO_PRESETS } from './presets/portfolioCreative'
import { PROFESSIONAL_PORTFOLIO_PRESETS } from './presets/portfolioProfessional'
import type { PromptPreset } from './presets/types'

/** A kind of page: its own intro (role + goal for the AI) and its own blank brief first. */
export type PromptGroup = { id: string; label: string; intro: string; presets: PromptPreset[] }

const PART_1 = 'PART 1 — THE PAGE (change this freely)'
const ROLE = 'You are an award-winning web designer and senior front-end developer.'
const MADE_FOR = 'It must look like a premium, custom-made site that a top design studio would be proud of — bold, memorable and never a generic template — while staying easy to read'

const intro = (what: string, goal: string) => `${ROLE} Build a complete, eye-catching ${what} for what is described in Part 1, using only HTML, CSS and plain JavaScript. ${MADE_FOR}, ${goal}

${PART_1}`

const blank = (id: string, examples: [string, string, string, string, string, string, string]): PromptPreset => ({
  id, label: 'Start blank', icon: '✏️',
  brief: `- What the page is for: [e.g. ${examples[0]}]
- Who will read it: [e.g. ${examples[1]}]
- Language of the text: [e.g. English]
- Sections, in this order: [e.g. ${examples[2]}]
- Look and feel: [e.g. ${examples[3]}]
- Fonts: [e.g. ${examples[4]}]
- Details: [e.g. ${examples[5]}; ${examples[6]}]`,
})

const byId = (list: PromptPreset[], ...ids: string[]) => ids.map((id) => list.find((preset) => preset.id === id)!)

/** Everyday businesses first (most people), then brands, events and portfolios. */
export const PROMPT_GROUPS: PromptGroup[] = [
  {
    id: 'everyday', label: 'Business & services',
    intro: intro('one-page website', 'and giving visitors one clear thing to do next.'),
    presets: [
      blank('blank', ['the website of my bakery; goal: get people to visit and order cakes', 'families and office workers nearby',
        'header, hero with a big photo, 3 highlights, menu with prices, about us, reviews, opening hours and map link, footer',
        'warm and cozy, cream and chocolate brown with a raspberry accent, full-width photos, rounded cards that lift on hover',
        'Playfair Display for headings, Inter for text', 'address, phone, opening hours', 'prices and links']),
      ...byId(BUSINESS_PRESETS, 'cafe', 'salon', 'realestate'), ...byId(COMMUNITY_PRESETS, 'course', 'charity'),
    ],
  },
  {
    id: 'brands', label: 'Brands & launches',
    intro: intro('brand or product launch website', 'and making visitors want the product right away, with one clear way to buy, pre-order or sign up.'),
    presets: [
      blank('brandBlank', ['launch page for our new oat-milk ice cream; goal: get pre-orders', 'young families and foodies',
        'header, hero with a big product photo, 3 benefits, flavours, how it is made, reviews, pricing, FAQ, final call, footer',
        'fresh and playful, pastel mint and cream with a bold cocoa accent, floating product shots, wavy dividers',
        'Bricolage Grotesque for headings, Inter for text', 'launch date, price and launch discount', 'where it is sold, social links']),
      ...byId(BRAND_PRESETS, 'brand'), ...byId(BUSINESS_PRESETS, 'shop'), ...byId(BRAND_PRESETS, 'appLaunch', 'fashionDrop', 'drinkBrand', 'skincareLaunch'),
    ],
  },
  {
    id: 'events', label: 'Events & celebrations',
    intro: intro('event website', 'capturing the mood of the occasion and making it easy to see the details and RSVP or get a ticket.'),
    presets: [
      blank('eventBlank', ['invitation page for our family reunion; goal: share details and collect RSVPs', 'relatives of all ages, mostly on phones',
        'hero with date and countdown, programme, location with map link, what to bring, photo wall, RSVP form, footer',
        'warm and joyful, golden yellow and deep teal, polaroid-style photos, confetti shapes, rounded cards',
        'Fraunces for headings, Nunito for text', 'date, time and address', 'RSVP deadline, contact person']),
      WEDDING_PRESET, ...CELEBRATION_PRESETS, ...byId(BIG_EVENT_PRESETS, 'festival'), ...byId(COMMUNITY_PRESETS, 'event'),
      ...byId(BIG_EVENT_PRESETS, 'conference', 'concert'),
    ],
  },
  {
    id: 'portfolio', label: 'Portfolios',
    intro: intro('portfolio website', 'personal to this person or studio: show who they are, prove their skill through real-looking work, build trust and give one clear way to get in touch.'),
    presets: [
      blank('portfolioBlank', ['personal portfolio for a freelance brand designer who wants more client enquiries', 'startups and small businesses hiring a designer',
        'header/nav, hero with name and role, about, selected work (6 project cards), services, process, tools, testimonials, contact, footer',
        'light warm-grey background, black text, one orange accent, large editorial headings', 'Fraunces for headings, Inter for text',
        'name, city, email and availability', 'social links, number of projects, years of experience']),
      ...CREATIVE_PORTFOLIO_PRESETS, ...PROFESSIONAL_PORTFOLIO_PRESETS, RESUME_PRESET,
    ],
  },
]
