import { chipsInner } from '@/features/editor/model/widgets/blocksTable'
import { widget } from '../site'
import { photo } from './photos'

const FADE_UP = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'

/** The "All / Branding / Web…" buttons: the ready-made filter, narrowing the project list by its category. */
function categoryFilter(): string {
  const chips = widget('filter-chips', { target: 'projects-list' })
  return chips
    .replace('class="ui-filter"', 'data-ui-by="category" class="ui-filter" style="margin-bottom: 40px"')
    .replace(/(aria-label="Filter">).*(<\/div>)$/, `$1${chipsInner(['Branding', 'Web', 'Product', 'Motion'])}$2`)
}

/** The Work page: every project from data, with buttons that narrow it by category. */
export function workHtml(): string {
  return `<section class="ag-section" style="padding-bottom: 40px"><div class="ag-wrap" data-fe-animate="fade-up" data-fe-trigger="load"><p class="ag-eyebrow">Work</p><h1 style="font-size: clamp(44px, 7vw, 88px)">Things we are proud of</h1><p class="ag-lead" style="margin-top: 24px">A mix of brands, websites, apps and films made with founders, charities and neighbourhood businesses. Pick a type to narrow the list.</p></div></section>
<section class="ag-section" style="padding-top: 24px"><div class="ag-wrap">
${categoryFilter()}
<div class="ag-work-list" data-ui-filterable="projects-list" data-fe-list="projects" data-fe-page-size="12" data-fe-load="all" ${FADE_UP} data-fe-stagger="0.08">
<article class="ag-work-card" data-fe-go="/work/:id" data-fe-bind-data-category="category"><img data-fe-bind-src="image" src="${photo('craft', 900, 700)}" alt="Project preview" data-fe-bind-alt="title"><p class="ag-tag"><span data-fe-bind="category">Branding</span> · <span data-fe-bind="year">2026</span></p><h3 data-fe-bind="title">Project</h3><p class="ag-muted" data-fe-bind="client">Client</p></article>
</div></div></section>`
}

/** The Project page (/work/:id): one project picked by the address, with its picture, words and a way back. */
export function projectHtml(): string {
  return `<section class="ag-section" data-fe-record="projects" data-fe-row="?id"><div class="ag-wrap">
<a href="/work" style="text-decoration: none; font-weight: 600">← All work</a>
<div ${FADE_UP} style="margin: 32px 0 48px"><p class="ag-eyebrow"><span data-fe-bind="category">Branding</span> · <span data-fe-bind="year">2026</span></p><h1 data-fe-bind="title" style="font-size: clamp(44px, 7vw, 96px)">Project</h1><p class="ag-lead" style="margin-top: 20px">For <strong data-fe-bind="client">Client</strong></p></div>
<img data-fe-animate="zoom-in" data-fe-trigger="scroll" data-fe-bind-src="image" src="${photo('craft', 1400, 800)}" alt="The finished project" data-fe-bind-alt="title" style="width: 100%; max-height: 560px; object-fit: cover; border-radius: 28px; display: block">
<div class="ag-grid ag-grid--2" ${FADE_UP} style="margin-top: 56px"><div><h3>The story</h3></div><p data-fe-bind="summary" style="font-size: 20px">Summary</p></div>
<div class="ag-row" style="margin-top: 48px"><a class="ag-btn" href="/contact">Start a project like this</a><a class="ag-btn ag-btn--ghost" href="/work">More work</a></div>
</div></section>`
}
