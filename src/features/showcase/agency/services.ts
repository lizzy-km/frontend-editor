import { widget } from '../site'

const FADE_UP = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'

/** The tabs widget with the studio's own services in each tab. */
function serviceTabs(): string {
  const items = [
    ['Brand', 'Brand identity', 'We begin with a workshop about what makes you different, then design a name, logo, colours, type and tone of voice. You get a short guide and every file you need, ready to use on day one.'],
    ['Web', 'Websites', 'Clear pages, fast loading and a design that fits phones first. We build it in a way you can edit yourself, so changing a price or a photo never needs a developer.'],
    ['Product', 'Apps and dashboards', 'We sketch, test with real people and refine until the main task takes a few taps. Handover includes a design system your engineers can build from.'],
    ['Motion', 'Film and motion', 'Short brand films, animated posters and social loops. Storyboard, sound and delivery in every format you need.'],
  ] as const
  let html = widget('tabs-pills')
  const tabs = items.map(([label], i) => `<button type="button" role="tab" class="ui-tab" data-ui-tab="tab-${i + 1}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${label}</button>`)
  const panels = items.map(([, title, text], i) => `<div role="tabpanel" class="ui-panel" data-ui-panel="tab-${i + 1}"${i ? ' hidden' : ''}><h3 style="margin: 0 0 12px; font-size: 30px">${title}</h3><p class="ag-muted" style="max-width: 680px">${text}</p></div>`)
  html = html.replace(/(<div role="tablist" class="ui-tablist">).*$/, `$1${tabs.join('')}</div>${panels.join('')}</div>`)
  return html
}

/** The package table: the striped table widget with the studio's three packages. */
function packages(): string {
  const row = (cells: string[]) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`
  const head = ['Package', 'Best for', 'Time', 'From'].map((label) => `<th scope="col" data-ui-sort tabindex="0">${label}</th>`).join('')
  const body = [row(['Spark', 'A name, logo and one-page site', '4 weeks', '$6,500']), row(['Launch', 'Full identity and a 5-page website', '8 weeks', '$16,000']), row(['Studio partner', 'A monthly team for design and web', 'Ongoing', '$7,500 / month'])].join('')
  return widget('table-striped').replace(/<table(.*?)>.*<\/table>/, `<table$1><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`)
}

/** The Services page: what we do in tabs, and the packages in a table. */
export function servicesHtml(): string {
  return `<section class="ag-section" style="padding-bottom: 40px"><div class="ag-wrap" data-fe-animate="fade-up" data-fe-trigger="load"><p class="ag-eyebrow">Services</p><h1 style="font-size: clamp(44px, 7vw, 88px)">How we can help</h1><p class="ag-lead" style="margin-top: 24px">Four things we do really well, and three simple ways to work with us.</p></div></section>
<section class="ag-section" style="padding-top: 24px"><div class="ag-wrap" ${FADE_UP}>${serviceTabs()}</div></section>
<section class="ag-section ag-dark"><div class="ag-wrap"><div ${FADE_UP} style="margin-bottom: 40px"><p class="ag-eyebrow">Packages</p><h2>Clear prices, no surprises</h2></div><div data-fe-animate="fade" data-fe-trigger="scroll" style="background: var(--ag-paper); color: var(--ag-ink); border-radius: var(--ag-radius); padding: 12px; overflow-x: auto">${packages()}</div><p class="ag-muted" style="margin-top: 24px; font-size: 15px">Prices are a guide. Every project gets a fixed quote after a free first call.</p></div></section>`
}
