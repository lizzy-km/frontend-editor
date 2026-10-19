import { buildSite } from '../site'
import type { Showcase } from '../types'
import { addTeamComponent } from './components'
import { contactHtml } from './contact'
import { FONTS, css } from './css'
import { homeHtml } from './home'
import { PROJECTS } from './rows'
import { servicesHtml } from './services'
import { teamHtml } from './team'
import { projectHtml, workHtml } from './work'

const footer = `<footer class="ag-footer"><div class="ag-wrap"><div><strong style="color: #f6f3ee; font-size: 18px">Northlight Studio</strong><br>Design and web for people with ideas.</div><div>hello@northlight.example<br>Rua das Flores 12, Lisbon</div><div><a href="/work">Work</a> &nbsp; <a href="/services">Services</a> &nbsp; <a href="/contact">Contact</a></div></div></footer>`


/** The studio portfolio example: a design agency site with data, filters, animation, reusable components, tabs, a table and a form. */
export const agencyShowcase: Showcase = {
  id: 'agency',
  title: 'Studio portfolio',
  tagline: 'A design studio site with a filterable project list, a detail page for every project, a team built from reusable cards and an enquiry form.',
  features: ['Projects from data', 'Filter buttons', 'Detail page for each project', 'Reusable team cards', 'Scroll animations', 'Tabs and a table', 'Enquiry form', 'Pop-ups'],
  requires: ['data-fe-list', 'data-fe-record', 'data-ui-filterable', 'data-ui-by', 'data-fe-instance', 'data-fe-animate', 'data-fe-submit', 'data-fe-modal', 'data-ui'],
  build: () => addTeamComponent(buildSite({
    title: 'Northlight Studio',
    css: css(),
    links: FONTS,
    home: homeHtml(),
    footer,
    data: [PROJECTS],
    pages: [
      { title: 'Work', path: '/work', html: workHtml() },
      { title: 'Project', path: '/work/:id', html: projectHtml(), inMenu: false },
      { title: 'Services', path: '/services', html: servicesHtml() },
      { title: 'Team', path: '/team', html: teamHtml() },
      { title: 'Contact', path: '/contact', html: contactHtml() },
    ],
  })),
}
