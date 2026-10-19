import { PHOTO, PICS } from './css'
import { dateInput, dietSwitch, guestsInput, timeSelect } from './widgets'

const FADE = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'
const TIMES = ['12:00', '12:30', '13:00', '13:30', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30']

/** The booking form: browser-checked fields, a date picker, a guests counter, a time drop-down and a dietary switch. */
const form = `<form class="cafe-form" data-fe-submit="send" data-fe-success="Thank you! Your table request is in. We will email you within a few hours to confirm it.">
<label>Your name<input name="name" required minlength="2" autocomplete="name" placeholder="Jane Doe"></label>
<label>Email<input type="email" name="email" required autocomplete="email" placeholder="jane@example.com"></label>
<label>Phone<input type="tel" name="phone" required autocomplete="tel" placeholder="555 0142"></label>
${dateInput()}${timeSelect(TIMES)}${guestsInput()}
<div class="cafe-full">${dietSwitch()}</div>
<label class="cafe-full">Anything we should know?<textarea name="notes" rows="4" maxlength="500" placeholder="A birthday, a high chair, an allergy..."></textarea></label>
<button type="submit" class="cafe-btn cafe-full">Request this table</button></form>`

/** The reservations page: a short welcome, the booking form and what to expect. */
export const reservationsHtml = `<section class="cafe-section"><div class="cafe-wrap cafe-split" style="align-items: start">
<div ${FADE}><span class="cafe-eyebrow">Reservations</span><h1 class="cafe-title">Save your seat</h1><p class="cafe-lead">Tell us when you would like to come and we will keep a table warm. For groups over 12, call us on 555 0142.</p>
<img src="${PHOTO(PICS.dining, 900)}" alt="A set table in the dining room with wooden chairs" style="margin-top: 28px">
<p style="margin-top: 20px; color: #6b5a4c">We hold tables for 15 minutes. Running late? Call us and we will wait. Walk-ins are always welcome at the counter.</p></div>
<div class="cafe-panel" ${FADE}>${form}</div></div></section>`
