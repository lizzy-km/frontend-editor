import { PHOTO, PICS } from './css'
import { widget } from '../site'

const FADE = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'
const PLACEHOLDER = PHOTO(PICS.dining, 800)
const shot = (picture: keyof typeof PICS, alt: string) => `<img src="${PHOTO(PICS[picture], 600)}" alt="${alt}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 16px; display: block">`

/** One event card; clicking it opens the event pop-up filled with that event. */
const card = `<article class="cafe-card" data-fe-open="event" style="cursor: pointer"><img data-fe-bind-src="image" data-fe-bind-alt="title" src="${PLACEHOLDER}" alt="An event at Maple &amp; Rye">`
  + '<div class="cafe-card-body"><span class="cafe-tag" data-fe-bind="when">Sat 7 Nov</span><h3 data-fe-bind="title">Event name</h3><p data-fe-bind="about">About the event.</p></div></article>'

/** The pop-up for the event that was clicked. */
const popup = `<div data-fe-modal="event" data-fe-record="events" data-fe-row="clicked" class="cafe-popup"><div class="cafe-popup-box">`
  + `<img data-fe-bind-src="image" data-fe-bind-alt="title" src="${PLACEHOLDER}" alt="The event you picked">`
  + '<div class="cafe-popup-body"><span class="cafe-tag" style="justify-self: start" data-fe-bind="when">Sat 7 Nov</span><h2 style="font-size: 28px" data-fe-bind="title">Event name</h2>'
  + '<p style="color: #6b5a4c" data-fe-bind="about">About the event.</p><p style="font-size: 14px">Places are limited. Book at the counter or ask for an event table in the reservation form.</p>'
  + '<div class="cafe-row"><a class="cafe-btn" href="/reservations">Reserve a place</a><button type="button" class="cafe-btn cafe-btn--ghost" data-fe-close>Close</button></div></div></div></div>'

/** The events page: a calendar, upcoming events that open a pop-up, and a small photo gallery. */
export const eventsHtml = `<section class="cafe-section"><div class="cafe-wrap">
<div class="cafe-center" ${FADE}><span class="cafe-eyebrow">Events and gallery</span><h1 class="cafe-title">Always something on</h1><p class="cafe-lead">Baking mornings, supper clubs and Sunday pancakes. Tap an event to read more.</p></div>
<div class="cafe-split" style="margin-top: 40px; align-items: start"><div ${FADE} style="display: grid; justify-items: center; gap: 12px"><h2 style="font-size: 26px">This season at a glance</h2>${widget('calendar')}<p style="font-size: 14px; color: #6b5a4c">Pick any day to plan your visit.</p></div>
<div class="cafe-menu-list" ${FADE} style="grid-template-columns: 1fr" data-fe-list="events" data-fe-page-size="10" data-fe-load="all">${card}</div></div></div></section>
<section class="cafe-section cafe-section--tint"><div class="cafe-wrap" ${FADE}><div class="cafe-center"><span class="cafe-eyebrow">Gallery</span><h2 class="cafe-title">A peek inside</h2></div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 32px">${shot('croissant', 'A croissant dusted with sugar')}${shot('lattes', 'Two lattes with leaf art held over a table')}${shot('brunch', 'A table of brunch dishes from above')}${shot('street', 'The cafe terrace on the street')}${shot('donuts', 'Glazed donuts with sprinkles')}${shot('veg', 'A bowl of roasted vegetables and avocado')}</div></div></section>${popup}`
