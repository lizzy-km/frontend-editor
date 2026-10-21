import { appBrief } from './presets/appBrief'
import { BOOKING_APPS } from './presets/appsBooking'
import { LEARNING_APPS } from './presets/appsLearning'
import { SHOP_APPS } from './presets/appsShops'
import { TOOL_APPS } from './presets/appsTools'
import type { PromptPreset } from './presets/types'
import type { PromptGroup } from './promptGroups'

const PART_1 = 'PART 1 — THE SITE (change this freely)'
const ROLE = 'You are a senior front-end engineer and product designer.'
const MADE_FOR = 'It must feel like a real, polished product, not a demo: clear flows, believable data, honest empty and error states, and a distinctive look'

/** The intro for a React project idea: role, what to build (a multi-page app with sign-in) and the goal. */
const intro = (what: string, goal: string) => `${ROLE} Build a complete ${what} as a multi-page React + TypeScript web app (a project of many files) for what is described in Part 1, with working sign-in, protected pages and realistic mock data. ${MADE_FOR}, ${goal}

${PART_1}`

/** A blank starting point with an example for every line of the brief. */
const blank = (id: string, example: { purpose: string; users: string; pages: string; features: string; data: string }): PromptPreset => ({
  id, label: 'Start blank', icon: '✏️',
  brief: appBrief({
    purpose: `[e.g. ${example.purpose}]`, users: `[e.g. ${example.users}]`, pages: [`[e.g. ${example.pages}]`], features: [`[e.g. ${example.features}]`], data: [`[e.g. ${example.data}]`],
    look: '[e.g. warm and modern, cream with a deep green accent, big photos, rounded cards]', fonts: '[e.g. Fraunces for headings, Inter for text]', details: '[e.g. prices, opening hours, demo account names, rules]',
  }),
})

/** Ideas for React projects: real multi-page apps with accounts, not single pages. */
export const REACT_PROMPT_GROUPS: PromptGroup[] = [
  {
    id: 'reactShops', label: 'Shops & marketplaces',
    intro: intro('online shop or marketplace', 'with a catalogue, a cart, orders and roles for the people who sell.'),
    presets: [blank('reactShopBlank', { purpose: 'the online store of my bakery; goal: customers order cakes and follow their orders', users: 'visitors, customers (orders) and an admin (products)',
      pages: 'Home, Shop, Product, Cart, Checkout (members), My orders (members), Log in, Create account, Admin products (admin), About, Contact', features: 'sign-in, a cart, protected checkout, order history, admin product form',
      data: 'products (name, price, category, pictures), orders (items, total, status)' }), ...SHOP_APPS],
  },
  {
    id: 'reactBooking', label: 'Booking & services',
    intro: intro('booking app', 'where people choose a time or a place, confirm it and manage what they booked.'),
    presets: [blank('reactBookingBlank', { purpose: 'the booking app of my dog grooming salon; goal: owners book and manage visits, groomers see their day', users: 'visitors, owners (bookings) and groomers (schedule)',
      pages: 'Home, Services, Book (members), My bookings (members), Log in, Create account, Groomer schedule (groomers), Contact', features: 'sign-in, a calendar with free slots, booking steps, cancel and reschedule, a groomer-only page',
      data: 'services, groomers, bookings (date, time, status)' }), ...BOOKING_APPS],
  },
  {
    id: 'reactLearning', label: 'Learning & community',
    intro: intro('learning, jobs or community site', 'where people read, write, join in and keep track of what they follow.'),
    presets: [blank('reactLearningBlank', { purpose: 'a book club site; goal: members suggest books, vote, comment and join monthly meetings', users: 'visitors, members (vote, comment, suggest) and an organiser',
      pages: 'Home, Books, Book, Suggest a book (members), Meetings, My profile (members), Log in, Create account, Organiser (organiser)', features: 'sign-in, votes, comments, a suggestion form, an organiser-only page',
      data: 'books (title, author, votes), comments, meetings (date, place, book)' }), ...LEARNING_APPS],
  },
  {
    id: 'reactTools', label: 'Dashboards & tools',
    intro: intro('dashboard or work tool', 'with lists, forms, charts and different views for different roles.'),
    presets: [blank('reactToolsBlank', { purpose: 'an inventory tool for my small shop; goal: track stock, suppliers and orders', users: 'staff (stock) and an owner (reports)',
      pages: 'Home, Log in, Dashboard (staff), Products (staff), Suppliers, Orders, Reports (owner), Settings', features: 'sign-in, tables with search and filters, add and edit forms, low-stock warnings, an owner-only reports page',
      data: 'products (sku, name, stock, price), suppliers, orders' }), ...TOOL_APPS],
  },
]

/** Every React idea, in display order. */
export const REACT_PROMPT_PRESETS: PromptPreset[] = REACT_PROMPT_GROUPS.flatMap((group) => group.presets)
