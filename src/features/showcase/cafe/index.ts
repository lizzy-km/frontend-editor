import { buildSite } from '../site'
import type { Showcase } from '../types'
import { aboutHtml } from './about'
import { CAFE_CSS, CAFE_LINKS } from './css'
import { eventsHtml } from './events'
import { homeHtml } from './home'
import { menuHtml } from './menu'
import { reservationsHtml } from './reservations'
import { eventsSource, menuSource } from './rows'

const footer = `<footer class="cafe-footer"><div class="cafe-footer-grid"><div><h3>Maple &amp; Rye</h3><p>Bread, coffee and seasonal cooking on Orchard Lane. Open Tuesday to Sunday.</p></div>
<div><h3>Visit</h3><p>12 Orchard Lane<br>Springfield<br>555 0142</p></div><div><h3>Explore</h3><p><a href="/menu">Menu</a><br><a href="/reservations">Reservations</a><br><a href="/events">Events</a></p></div></div>
<small>&copy; 2026 Maple &amp; Rye. A sample site.</small></footer>`

/** The finished "Maple & Rye" example: five pages, a menu from data with search and filters, a booking form, pop-ups, a calendar and tabs. */
export const cafeShowcase: Showcase = {
  id: 'cafe',
  title: 'Cafe and restaurant',
  tagline: 'A warm neighbourhood cafe with a searchable menu, a table booking form and events people can click.',
  features: ['Menu from data', 'Search and filters', 'Booking form', 'Pop-ups', 'Calendar', 'Tabs', 'Animations'],
  requires: ['data-fe-list', 'data-ui-filterable', 'data-ui-for', 'data-ui', 'data-fe-modal', 'data-fe-open', 'data-fe-submit', 'data-fe-animate'],
  build: () => buildSite({
    title: 'Maple & Rye',
    css: CAFE_CSS,
    links: CAFE_LINKS,
    home: homeHtml,
    footer,
    data: [menuSource(), eventsSource()],
    pages: [
      { title: 'Menu', path: '/menu', html: menuHtml },
      { title: 'Reservations', path: '/reservations', html: reservationsHtml },
      { title: 'Events', path: '/events', html: eventsHtml },
      { title: 'About and contact', path: '/about', html: aboutHtml },
    ],
  }),
}
