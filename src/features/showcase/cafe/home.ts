import { PHOTO, PICS } from './css'
import { tabsWith } from './widgets'

const FADE = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'
const special = (picture: keyof typeof PICS, alt: string, tag: string, name: string, text: string, price: string) =>
  `<article class="cafe-card"><img src="${PHOTO(PICS[picture], 700)}" alt="${alt}"><div class="cafe-card-body"><span class="cafe-tag">${tag}</span><div class="cafe-dish"><h3>${name}</h3><span class="cafe-price">${price}</span></div><p>${text}</p></div></article>`
const review = (stars: number, text: string, who: string) =>
  `<article class="cafe-card cafe-quote"><div class="cafe-card-body"><div class="cafe-stars" aria-label="${stars} out of 5 stars">${'★'.repeat(stars)}</div><p>${text}</p><strong>${who}</strong></div></article>`

const hours = tabsWith('tabs-pills', [
  ['Breakfast', '<h3 style="margin: 0 0 8px">Breakfast, 7:30 to 11:30</h3><p style="margin: 0; color: #6b5a4c">Pancakes, eggs on rye and the first croissants out of the oven. Weekend breakfast runs until noon.</p>'],
  ['Lunch', '<h3 style="margin: 0 0 8px">Lunch, 11:30 to 15:00</h3><p style="margin: 0; color: #6b5a4c">Grain bowls, melts, burgers and a salad of the day. Order at the counter or take it to go.</p>'],
  ['Dinner', '<h3 style="margin: 0 0 8px">Dinner, Thursday to Saturday, 17:30 to 21:30</h3><p style="margin: 0; color: #6b5a4c">Wood-fired pizza and a short seasonal menu at the table. Booking is a good idea on Fridays.</p>'],
])

/** The home page: hero, today's specials, our story, opening hours (tabs) and guest reviews. */
export const homeHtml = `<section class="cafe-hero"><img src="${PHOTO(PICS.interior, 1600)}" alt="The warm, busy dining room of Maple &amp; Rye in the morning"><div class="cafe-wrap" data-fe-animate="fade-up" data-fe-trigger="load">
<span class="cafe-eyebrow">Bakery, cafe and kitchen</span><h1>Slow mornings, honest food.</h1><p>Rye bread from our own oven, coffee roasted down the road and a kitchen that cooks what is in season.</p>
<div class="cafe-row"><a class="cafe-btn" href="/reservations">Book a table</a><a class="cafe-btn cafe-btn--light" href="/menu">See the menu</a></div></div></section>
<section class="cafe-section"><div class="cafe-wrap" ${FADE}><div class="cafe-center"><span class="cafe-eyebrow">Today's specials</span><h2 class="cafe-title">Fresh from the kitchen</h2><p class="cafe-lead">Three plates our cooks are proud of this week. When they are gone, they are gone.</p></div>
<div class="cafe-grid">${special('pancakes', 'A stack of pancakes with maple syrup', 'Breakfast special', 'Maple pancake stack', 'Buttermilk pancakes, whipped butter and warm maple syrup.', '$13')}${special('pizza', 'A wood-fired pizza with onions and basil', 'Lunch special', 'Wood-fired pizza', 'Caramelised onion, roast chicken, mozzarella and basil.', '$18')}${special('plated', 'A rye chocolate tart on a plate', 'Dessert special', 'Rye chocolate tart', 'Dark chocolate in a rye biscuit crust with sea salt.', '$8')}</div></div></section>
<section class="cafe-section cafe-section--tint"><div class="cafe-wrap cafe-split"><div ${FADE}><span class="cafe-eyebrow">Our story</span><h2 class="cafe-title">Two ovens, one small street</h2>
<p>Maple &amp; Rye began in 2016 with a single oven and a stubborn sourdough starter. Today we still bake before sunrise, and we still buy our flour, eggs and milk from farms within an hour's drive.</p>
<p>Come for a coffee, stay for lunch, bring the whole family. There is always a seat at the long table.</p><p style="margin-top: 24px"><a class="cafe-btn cafe-btn--ghost" href="/about">Meet the team</a></p></div>
<img src="${PHOTO(PICS.bread, 900)}" alt="Freshly baked rye and seeded loaves on a baking tray" ${FADE}></div></section>
<section class="cafe-section"><div class="cafe-wrap" ${FADE} style="max-width: 760px"><div class="cafe-center" style="margin-bottom: 28px"><span class="cafe-eyebrow">Opening hours</span><h2 class="cafe-title">When to find us</h2></div>
<div class="cafe-panel">${hours}</div><p class="cafe-center" style="margin-top: 18px; color: #6b5a4c">Open Tuesday to Sunday. Closed on Mondays. See the <a href="/about" style="color: #b4501d">full week</a>.</p></div></section>
<section class="cafe-section cafe-section--tint"><div class="cafe-wrap" ${FADE}><div class="cafe-center"><span class="cafe-eyebrow">Kind words</span><h2 class="cafe-title">What our guests say</h2></div>
<div class="cafe-grid">${review(5, 'The best rye bread I have ever had, and the maple latte is dangerously good. We come every Saturday.', 'Hannah R., regular')}${review(5, 'Booked the long table for my mum\'s birthday. The staff were lovely and the pizza was perfect.', 'Marcus T., birthday dinner')}${review(4, 'Great brunch and friendly service. Gets busy on weekends, so book ahead. Worth the wait.', 'Priya S., weekend brunch')}</div></div></section>`
