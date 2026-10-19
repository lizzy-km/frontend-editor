import { widget } from '../site'

const FADE_UP = 'data-fe-animate="fade-up" data-fe-trigger="scroll"'

/** The budget drop-down widget with budget ranges instead of countries. */
function budgetSelect(): string {
  const ranges = ['Under $10k', '$10k to $25k', '$25k to $50k', 'Over $50k']
  const options = ranges.map((range) => `<li role="option" class="ui-option" data-ui-option data-value="${range}" aria-selected="false">${range}</li>`).join('')
  return widget('select')
    .replace('>Country<', '>Budget<').replace('name="country"', 'name="budget"')
    .replace(/(<ul role="listbox" class="ui-options">).*?(<\/ul>)/, `$1${options}$2`)
}

/** The date picker widget, renamed for the start date. */
const startDate = () => widget('datepicker').replace('>Date<', '>Ideal start date<').replace('name="date"', 'name="start"')

const field = (label: string, input: string) => `<label style="display: grid; gap: 8px; font-weight: 600; font-size: 15px">${label}${input}</label>`
const INPUT = 'class="ui-input" style="font-weight: 400; padding: 13px 14px"'

/** The Contact page: a project enquiry form with browser checks, a budget list, a start date and a thank-you pop-up. */
export function contactHtml(): string {
  return `<section class="ag-section"><div class="ag-wrap ag-grid ag-grid--2" style="gap: 64px; align-items: start">
<div data-fe-animate="fade-up" data-fe-trigger="load"><p class="ag-eyebrow">Contact</p><h1 style="font-size: clamp(44px, 7vw, 88px)">Tell us about your project</h1><p class="ag-lead" style="margin: 24px 0 32px">A few lines is plenty. We read every message and reply within two working days.</p>
<p><strong>hello@northlight.example</strong><br><span class="ag-muted">Rua das Flores 12, Lisbon</span></p></div>
<form class="ag-card" data-fe-submit="send" data-fe-success="Thank you. We have your message and will reply within two working days." ${FADE_UP} style="gap: 20px">
${field('Your name', `<input ${INPUT} type="text" name="name" required minlength="2" autocomplete="name">`)}
${field('Email', `<input ${INPUT} type="email" name="email" required autocomplete="email" data-fe-message="Please enter an email address we can reply to.">`)}
${field('Company (optional)', `<input ${INPUT} type="text" name="company" maxlength="80">`)}
<div class="ag-grid ag-grid--2" style="gap: 20px">${budgetSelect()}${startDate()}</div>
${field('What would you like to make?', `<textarea ${INPUT} name="message" rows="5" required minlength="20" maxlength="1200" placeholder="A few lines about the idea, the audience and the deadline."></textarea>`)}
<label style="display: flex; gap: 10px; align-items: center; font-size: 15px"><input type="checkbox" name="updates"> Send me the studio newsletter (four a year)</label>
<button type="submit" class="ag-btn">Send my enquiry</button>
<button type="button" class="ag-btn ag-btn--ghost" data-fe-open="thanks">What happens next?</button>
</form></div></section>
<div data-fe-modal="thanks" style="background: rgba(14,15,18,.7); padding: 24px"><div class="ag-card" style="max-width: 460px; width: 100%; gap: 16px"><h3>What happens next</h3><p class="ag-muted">1. We read your message and reply within two working days.<br>2. We book a free 30 minute call.<br>3. You get a fixed quote and plan within a week.</p><button type="button" class="ag-btn" data-fe-close>Got it</button></div></div>`
}
