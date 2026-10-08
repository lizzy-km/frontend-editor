import type { PromptPreset } from './types'

/** Events, learning and good causes. */
export const COMMUNITY_PRESETS: PromptPreset[] = [
  {
    id: 'event',
    label: 'Event or workshop',
    icon: '🎟️',
    brief: `- What the page is for: page for "Build Your First Website", a one-day beginner workshop. Goal: get people to sign up.
- Who will read it: complete beginners, small business owners and students.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "Weekend Web", links (What you'll learn, Schedule, Host, Tickets, FAQ) and a "Get a ticket" button.
  2. Hero: headline, date, place, a live countdown to the start, and a "Get a ticket" button; friendly photo of people learning.
  3. What you'll learn: 6 cards with icon and one sentence each.
  4. Schedule: the day as a timeline (10:00 welcome … 17:00 show and tell).
  5. Host: photo, name, short bio and 3 numbers (years teaching, students, workshops).
  6. Tickets: 3 price cards (Early bird, Standard, Bring a friend), the middle one highlighted, with what's included.
  7. Reviews: 3 quotes from past attendees.
  8. FAQ: 5 questions as <details> (laptop needed, beginners welcome, food, refunds, certificate).
  9. Location: address, how to get there, accessibility note.
  10. Footer: links, contact email, © year.
- Look and feel: energetic and bold: deep violet hero with a lime-green accent, large playful blob shapes and a subtle grain texture, chunky rounded buttons, sticker-style badges, a bright countdown in big numbers, cards that tilt slightly on hover.
- Fonts: Space Grotesk for headings, Inter for text.
- Details: Saturday 14 November 2026, 10:00–17:00, The Hive, 9 Market Lane, Manchester. Early bird £49, standard £69.`,
  },
  {
    id: 'course',
    label: 'Online course',
    icon: '🎓',
    brief: `- What the page is for: sales page for "Calm Money", a 6-week online course about personal budgeting. Goal: get people to enroll.
- Who will read it: adults who feel stressed about money and want a simple plan.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "Calm Money", links (Course, Lessons, Teacher, Pricing, FAQ) and an "Enroll" button.
  2. Hero: headline about feeling in control of your money, one sentence, "Enroll now" button and small trust line (students, rating).
  3. Is this for you: two columns, "This is for you if…" and "This is not for you if…" lists.
  4. What you'll get: 4 feature cards (video lessons, worksheets, community, live Q&A).
  5. Lessons: the 6 weeks as an accordion of <details>, each with 3 lesson titles.
  6. Teacher: photo, name, short story and credentials.
  7. Results: 3 student stories with photo, name and result.
  8. Pricing: 2 plans (Self-paced, With coaching), monthly and one-time toggle buttons.
  9. Guarantee: 30-day money-back badge and one sentence.
  10. FAQ: 5 questions as <details>.
  11. Footer: links, contact, © year.
- Look and feel: reassuring and uplifting: warm white with deep teal and soft sunshine-yellow, a friendly hero with a big rounded photo of the teacher and floating stat bubbles, illustration-style icons, rounded cards, highlighted "most popular" plan with a soft glow.
- Fonts: Nunito for headings, Inter for text.
- Details: self-paced $149, with coaching $299. Next live group starts 2 March 2026.`,
  },
  {
    id: 'charity',
    label: 'Charity or fundraiser',
    icon: '🤝',
    brief: `- What the page is for: fundraising page for "Green Corners", a nonprofit that turns empty city lots into community gardens. Goal: get donations and volunteers.
- Who will read it: local residents, families and companies who want to help.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "Green Corners", links (Our work, Impact, Get involved, Donate) and a "Donate" button.
  2. Hero: photo of people gardening, headline, one sentence and two buttons ("Donate", "Volunteer").
  3. Progress: fundraising goal with a progress bar, amount raised, number of donors and days left.
  4. Our work: 3 cards (Plant, Teach, Share) with photo and short text.
  5. Impact: 4 big numbers (gardens built, volunteers, kg of food grown, schools involved) that count up when scrolled into view.
  6. Stories: 2 short stories from neighbours with photo.
  7. Donate: 4 amount buttons ($10, $25, $50, $100), one-time / monthly choice and what each amount pays for.
  8. Volunteer: short form (name, email, how you'd like to help) with a thank-you message.
  9. Partners: a row of 5 partner names as simple text logos.
  10. Footer: registered charity number, contact, social links, © year.
- Look and feel: hopeful and full of life: fresh green, earthy brown and sunny yellow on white, a full-width photo hero with a warm overlay, an animated progress bar, big impact numbers, organic leaf shapes (inline SVG) as decoration, natural, real-feeling photos.
- Fonts: Bricolage Grotesque for headings, Inter for text.
- Details: goal $50,000, raised $31,400, 412 donors, 18 days left.`,
  },
]
