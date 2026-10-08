import type { PromptPreset } from './types'

/** Public events with tickets (the workshop lives in community.ts). */
export const BIG_EVENT_PRESETS: PromptPreset[] = [
  {
    id: 'festival',
    label: 'Festival',
    icon: '🎪',
    brief: `- What the page is for: page for "Sunwave Festival 2026", a 3-day summer music and arts festival by the sea. Goal: sell tickets.
- Who will read it: festival-goers aged 18–35, mostly on phones.
- Language of the text: English
- Sections, in this order:
  1. Header: festival logo, links (Line-up, Tickets, Experience, Info, FAQ) and a "Buy tickets" button.
  2. Hero: full-screen crowd-at-sunset photo with a warm gradient overlay, giant festival name, dates and place, a live countdown and "Buy tickets" button.
  3. Line-up: headliners in huge type, then 3 days as tabs (Friday, Saturday, Sunday), each with 12 artist names in descending size.
  4. Experience: bento grid of 6 photo tiles (main stage, beach stage, food market, art installations, camping, sunrise yoga).
  5. Tickets: 3 ticket cards (Day pass, Weekend pass, VIP), the weekend pass highlighted, with what's included and "sold out soon" badges.
  6. Map and getting there: a stylised map image, shuttle, train and parking info.
  7. Partners: a row of 6 partner names as text logos.
  8. FAQ: 6 questions as <details> (age limit, camping, refunds, accessibility, what to bring, cashless payments).
  9. Newsletter: "Be first to hear the next acts" with an email form and a thank-you message.
  10. Footer: social links, © year.
- Look and feel: vibrant summer energy: sunset orange, hot pink and electric turquoise gradients on deep night blue, wavy shapes, grain texture, huge condensed type, sticker-style badges, hover tilts and glows.
- Fonts: Bebas Neue for headlines, Space Grotesk for text.
- Details: 17–19 July 2026, Playa Norte, Valencia, Spain. Day pass €79, weekend €189, VIP €349.`,
  },
  {
    id: 'conference',
    label: 'Conference',
    icon: '🎤',
    brief: `- What the page is for: page for "FutureWork Summit 2026", a one-day conference about AI and the future of work. Goal: sell tickets and attract sponsors.
- Who will read it: business leaders, HR professionals and tech managers.
- Language of the text: English
- Sections, in this order:
  1. Header: logo, links (Speakers, Agenda, Tickets, Venue, Sponsors) and a "Get your ticket" button.
  2. Hero: bold headline, date, city, a live countdown, two buttons ("Get your ticket", "See the agenda") and 4 numbers (speakers, attendees, sessions, countries) over an abstract gradient mesh.
  3. Speakers: 8 speaker cards with photo, name, role and company; photo turns from grey to color on hover.
  4. Agenda: two tracks as tabs, each a timeline of sessions with time, title and speaker.
  5. Why attend: 4 cards with icon and one line.
  6. Tickets: 3 tiers (Standard, Pro, Team of 5) with features; Pro highlighted.
  7. Venue: photo, address, hotel partners.
  8. Sponsors: tiered logo wall as text logos and a "Become a sponsor" link.
  9. FAQ: 5 questions as <details>.
  10. Footer: links, © year.
- Look and feel: smart and futuristic: deep navy with electric blue and coral accents, glowing gradient mesh, glass cards, crisp grid lines, sharp sans-serif type.
- Fonts: Sora for headings, Inter for text.
- Details: Thursday 15 October 2026, 09:00–18:00, Amsterdam RAI. Standard €299, Pro €499.`,
  },
  {
    id: 'concert',
    label: 'Concert or gig',
    icon: '🎸',
    brief: `- What the page is for: page for the "Midnight Echoes — Live in Berlin" concert of the indie band "Paper Moons". Goal: sell tickets.
- Who will read it: fans aged 18–40.
- Language of the text: English
- Sections, in this order:
  1. Hero: moody stage photo with smoke and colored light, band name in huge letters, tour title, date, venue, a countdown and a "Get tickets" button.
  2. About the show: 2 short paragraphs and a quote from a music magazine.
  3. Setlist preview: 6 song titles as a numbered list with "and more…".
  4. Listen: 3 album cards with cover, year and a "Listen" link.
  5. Tickets: 2 options (Standing, Balcony) with price and availability badges.
  6. Tour dates: a list of 6 other cities with date and a "Tickets" link each.
  7. Gallery: 6 live photos in a masonry-style grid.
  8. Footer: social links, © year.
- Look and feel: dark and atmospheric: black and deep plum with neon magenta and cyan light accents, film grain, glowing text shadows, slow light-sweep animation on the hero, high-contrast photography.
- Fonts: Syne for headlines, Inter for text.
- Details: Saturday 14 November 2026, doors 19:00, show 20:30, Columbiahalle, Berlin. Standing €45, balcony €65.`,
  },
]
