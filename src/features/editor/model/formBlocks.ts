import { MATCH_ATTR, SUBMIT_ATTR, SUCCESS_ATTR } from './forms'

/** Ready-made forms for Add > Ready-made: plain HTML with inline styles, so they look right on any page. */

const FIELD = 'display: grid; gap: 6px; font-size: 14px; font-weight: 600'
const INPUT = 'font: inherit; font-weight: 400; padding: 11px 14px; border: 1px solid #d6d3d1; border-radius: 10px; background: #fff; color: #1c1917'
const BUTTON = 'font: inherit; font-weight: 700; padding: 13px 20px; border: 0; border-radius: 10px; background: #1c1917; color: #fff; cursor: pointer'
const BOX = 'display: grid; gap: 16px; max-width: 520px; margin: 48px auto; padding: 32px; border: 1px solid #e7e5e4; border-radius: 18px; background: #fff; box-shadow: 0 18px 40px -24px rgba(28, 25, 23, .35)'

const field = (label: string, control: string) => `<label style="${FIELD}">${label}${control}</label>`

/** A contact form: name, email, topic, message and a "may we email you" tick box. */
export const CONTACT_FORM_HTML = `<form ${SUBMIT_ATTR}="send" ${SUCCESS_ATTR}="Thank you! We'll get back to you within a day." style="${BOX}">`
  + '<h2 style="margin: 0">Get in touch</h2><p style="margin: 0; color: #57534e">Questions, ideas or a quote: we answer within a day.</p>'
  + field('Your name', `<input name="name" required minlength="2" autocomplete="name" placeholder="Jane Doe" style="${INPUT}">`)
  + field('Email', `<input type="email" name="email" required autocomplete="email" placeholder="jane@example.com" style="${INPUT}">`)
  + field('Topic', `<select name="topic" required style="${INPUT}"><option value="">Choose one</option><option>A question</option><option>A quote</option><option>Something else</option></select>`)
  + field('Message', `<textarea name="message" required minlength="10" maxlength="1000" rows="5" placeholder="How can we help?" style="${INPUT}"></textarea>`)
  + '<label style="display: flex; gap: 10px; align-items: center; font-size: 14px"><input type="checkbox" name="newsletter"> Send me news now and then</label>'
  + `<button type="submit" style="${BUTTON}">Send message</button></form>`

/** A sign-up form: name, email, password twice and accepting the terms. */
export const SIGN_UP_FORM_HTML = `<form ${SUBMIT_ATTR}="send" ${SUCCESS_ATTR}="Welcome aboard! Check your inbox." style="${BOX}">`
  + '<h2 style="margin: 0">Create your account</h2>'
  + field('Full name', `<input name="name" required minlength="2" autocomplete="name" style="${INPUT}">`)
  + field('Email', `<input type="email" name="email" required autocomplete="email" style="${INPUT}">`)
  + field('Password', `<input type="password" name="password" required minlength="8" autocomplete="new-password" style="${INPUT}">`)
  + field('Repeat password', `<input type="password" name="confirmPassword" required ${MATCH_ATTR}="password" autocomplete="new-password" style="${INPUT}">`)
  + '<label style="display: flex; gap: 10px; align-items: center; font-size: 14px"><input type="checkbox" name="terms" required> I accept the terms</label>'
  + `<button type="submit" style="${BUTTON}">Create account</button></form>`
