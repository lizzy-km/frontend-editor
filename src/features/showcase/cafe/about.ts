import { PHOTO, PICS } from './css'
import { tableWith } from './widgets'

const FADE = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'
const hours = tableWith('table-striped', ['Day', 'Opens', 'Closes', 'Kitchen'], [
  ['Monday', 'Closed', 'Closed', 'Resting'], ['Tuesday', '7:30', '15:00', 'Breakfast and lunch'], ['Wednesday', '7:30', '15:00', 'Breakfast and lunch'],
  ['Thursday', '7:30', '21:30', 'Dinner from 17:30'], ['Friday', '7:30', '21:30', 'Dinner from 17:30'], ['Saturday', '8:00', '21:30', 'Brunch, then dinner'], ['Sunday', '8:00', '16:00', 'Brunch and lunch'],
])
const person = (picture: keyof typeof PICS, alt: string, name: string, role: string, text: string) =>
  `<article class="cafe-card"><img src="${PHOTO(PICS[picture], 700)}" alt="${alt}"><div class="cafe-card-body"><span class="cafe-tag">${role}</span><h3>${name}</h3><p>${text}</p></div></article>`

/** The contact form: the plain "send" behaviour with a thank-you message. */
const contact = `<form class="cafe-form" data-fe-submit="send" data-fe-success="Thanks for writing! We read every message and will reply within two working days.">
<label>Your name<input name="name" required minlength="2" autocomplete="name"></label><label>Email<input type="email" name="email" required autocomplete="email"></label>
<label class="cafe-full">Message<textarea name="message" rows="5" required minlength="10" maxlength="1000" placeholder="Catering, feedback, a job, a hello..."></textarea></label>
<button type="submit" class="cafe-btn">Send message</button></form>`

/** The about and contact page: our story, the team, the weekly opening hours table, how to find us and a contact form. */
export const aboutHtml = `<section class="cafe-section"><div class="cafe-wrap cafe-split"><div ${FADE}><span class="cafe-eyebrow">About us</span><h1 class="cafe-title">Family-run, flour on our hands</h1>
<p>Maple &amp; Rye is a neighbourhood bakery and kitchen on Orchard Lane. We bake our own bread, roast our own beans with a roaster two streets away and change the menu with the seasons.</p>
<p>We pay our suppliers fairly, compost what we cannot use and hire from the neighbourhood. If you can smell bread from the corner, you are close.</p></div>
<img src="${PHOTO(PICS.street, 900)}" alt="The cafe terrace with tables and a chalkboard sign" ${FADE}></div></section>
<section class="cafe-section cafe-section--tint"><div class="cafe-wrap" ${FADE}><div class="cafe-center"><span class="cafe-eyebrow">The people</span><h2 class="cafe-title">Who feeds you</h2></div>
<div class="cafe-grid">${person('bread', 'A loaf of rye bread made by the head baker', 'Elena Brandt', 'Head baker', 'Up at 4 a.m. every day. Her rye starter is eight years old and has a name.')}${person('pour', 'A barista pouring steamed milk into a coffee cup', 'Sam Okafor', 'Head barista', 'Trained in three countries, still happiest pouring a plain flat white.')}${person('plated', 'A carefully plated dessert', 'Tom Alvarez', 'Chef', 'Cooks what the farms bring in that week and never wastes a vegetable.')}</div></div></section>
<section class="cafe-section"><div class="cafe-wrap cafe-split" style="align-items: start"><div ${FADE}><span class="cafe-eyebrow">Opening hours</span><h2 class="cafe-title">The week at Maple &amp; Rye</h2><div class="cafe-hours" style="margin-top: 20px">${hours}</div></div>
<div ${FADE}><span class="cafe-eyebrow">Find us</span><h2 class="cafe-title">Say hello</h2><p><strong>Maple &amp; Rye</strong><br>12 Orchard Lane, Springfield<br>Phone 555 0142<br>hello@mapleandrye.example</p><p style="margin-top: 14px; color: #6b5a4c">Two minutes from the Orchard Lane tram stop. Bike racks by the door, a pram-friendly entrance and a water bowl for dogs.</p>
<div class="cafe-panel" style="margin-top: 24px">${contact}</div></div></div></section>`
