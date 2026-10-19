import { photo } from './photos'

const FADE_UP = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'

const service = (n: string, title: string, text: string) => `<div class="ag-card"><span class="ag-num">${n}</span><h3>${title}</h3><p class="ag-muted">${text}</p></div>`
const stat = (value: string, label: string) => `<div class="ag-stat"><b>${value}</b><p class="ag-muted">${label}</p></div>`
const quote = (text: string, who: string, role: string, face: 'woman2' | 'man2' | 'woman3') =>
  `<figure class="ag-quote" style="margin: 0"><p>“${text}”</p><div class="ag-row"><img src="${photo(face, 96, 96)}" alt="${who}" width="48" height="48" style="border-radius: 50%; object-fit: cover"><div><strong>${who}</strong><br><small>${role}</small></div></div></figure>`

/** The home page: hero, selected work from data, services, numbers, testimonials and a call to action. */
export function homeHtml(): string {
  return `<section class="ag-hero">
<div class="ag-orb ag-orb--a" aria-hidden="true"></div><div class="ag-orb ag-orb--b" aria-hidden="true"></div>
<div class="ag-wrap ag-hero-inner">
<p class="ag-eyebrow" data-fe-animate="fade" data-fe-trigger="load">Design and web studio, Lisbon and online</p>
<h1 data-fe-animate="fade-up" data-fe-trigger="load" data-fe-delay="0.15">We make brands<br>people <span>remember.</span></h1>
<p class="ag-lead" data-fe-animate="fade-up" data-fe-trigger="load" data-fe-delay="0.3">Northlight is a small team of designers and developers. We turn young companies into confident ones with identity, websites and apps that feel finished.</p>
<div class="ag-row" data-fe-animate="fade-up" data-fe-trigger="load" data-fe-delay="0.45"><a class="ag-btn" href="/contact">Start a project</a><button type="button" class="ag-btn ag-btn--ghost" data-fe-open="showreel">Watch our showreel</button></div>
</div></section>
<section class="ag-section" style="padding-top: 40px"><div class="ag-wrap">
<div class="ag-head" ${FADE_UP}><div><p class="ag-eyebrow">Selected work</p><h2>Recent projects</h2></div><a class="ag-btn ag-btn--ghost" href="/work">See all work</a></div>
<div class="ag-work-list" data-fe-list="projects" data-fe-page-size="3" data-fe-load="all" data-fe-animate="fade-up" data-fe-trigger="scroll" data-fe-stagger="0.12">
<article class="ag-work-card" data-fe-go="/work/:id"><img data-fe-bind-src="image" src="${photo('craft', 900, 700)}" alt="Project preview" data-fe-bind-alt="title"><p class="ag-tag" data-fe-bind="category">Branding</p><h3 data-fe-bind="title">Project</h3><p class="ag-muted" data-fe-bind="client">Client</p></article>
</div></div></section>
<section class="ag-section ag-dark"><div class="ag-wrap">
<div ${FADE_UP} style="margin-bottom: 48px; max-width: 640px"><p class="ag-eyebrow">What we do</p><h2>One team from first sketch to launch day</h2></div>
<div class="ag-grid ag-grid--3" data-fe-animate="zoom-in" data-fe-trigger="scroll" data-fe-stagger="0.12">
${service('01', 'Brand identity', 'Names, logos, colour and voice, gathered into a guide your whole team can use.').replace('class="ag-card"', 'class="ag-card" style="background:#17181d;border-color:#2a2c33"')}
${service('02', 'Websites', 'Fast, friendly sites you can edit yourself, built to be found and to turn visitors into customers.').replace('class="ag-card"', 'class="ag-card" style="background:#17181d;border-color:#2a2c33"')}
${service('03', 'Product design', 'Apps and dashboards that people understand on the first try, tested with real users.').replace('class="ag-card"', 'class="ag-card" style="background:#17181d;border-color:#2a2c33"')}
</div></div></section>
<section class="ag-section"><div class="ag-wrap"><div class="ag-grid ag-grid--4" data-fe-animate="fade-up" data-fe-trigger="scroll" data-fe-stagger="0.1">
${stat('12', 'years of making things')}${stat('140+', 'projects launched')}${stat('38', 'happy long-term clients')}${stat('4.9', 'average client rating')}
</div></div></section>
<section class="ag-section" style="padding-top: 0"><div class="ag-wrap">
<div ${FADE_UP} style="margin-bottom: 48px"><p class="ag-eyebrow">Kind words</p><h2>Clients who came back</h2></div>
<div class="ag-grid ag-grid--3" data-fe-animate="fade" data-fe-trigger="scroll" data-fe-stagger="0.15">
${quote('They understood our business in one meeting and gave us a brand we are proud to put on a shopfront.', 'Marta Oliveira', 'Founder, Harbour &amp; Pine', 'woman2')}
${quote('Calm, clear and always on time. Our new site doubled online orders in the first season.', 'Daniel Reyes', 'Director, Fieldnote', 'man2')}
${quote('The app is so simple our customers stopped phoning us for help. That is the best review we could ask for.', 'Priya Nair', 'Product lead, Orbit Finance', 'woman3')}
</div></div></section>
<section class="ag-section ag-dark"><div class="ag-wrap ag-cta" ${FADE_UP}><h2>Have something<br>worth building?</h2><p class="ag-lead ag-muted">Tell us about your idea. We reply within two working days, with ideas and a fair price.</p><a class="ag-btn" href="/contact">Start a project</a></div></section>
<div data-fe-modal="showreel" style="background: rgba(14,15,18,.82); padding: 24px"><div style="background: #0e0f12; color: #f6f3ee; border-radius: 20px; max-width: 760px; width: 100%; padding: 20px; display: grid; gap: 16px"><img src="${photo('neon', 1200, 675)}" alt="A frame from our 2026 showreel" style="width: 100%; border-radius: 12px; aspect-ratio: 16 / 9; object-fit: cover"><div class="ag-row" style="justify-content: space-between"><p>Our 2026 showreel: 90 seconds of motion, brand and web.</p><button type="button" class="ag-btn ag-btn--ghost" data-fe-close>Close</button></div></div></div>`
}
