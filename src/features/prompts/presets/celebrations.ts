import type { PromptPreset } from './types'

/** Private celebrations (the wedding lives in personal.ts). */
export const CELEBRATION_PRESETS: PromptPreset[] = [
  {
    id: 'birthday',
    label: 'Birthday party',
    icon: '🎂',
    brief: `- What the page is for: invitation page for Mia's 30th birthday party, "Dirty Thirty Disco". Goal: share the details and collect RSVPs.
- Who will read it: friends and family, almost all on phones.
- Language of the text: English
- Sections, in this order:
  1. Hero: big disco-ball photo or illustration, "Mia turns 30!" headline, the party theme, date, time and a live countdown, and an "RSVP" button.
  2. The plan: a timeline of the night (arrivals and cocktails, dinner, cake, dance floor, after-party).
  3. Location: venue name, address, an "Open in Maps" link and how to get there.
  4. Dress code: "70s disco glam" with 4 outfit idea cards (photo + one line).
  5. Playlist: a short note and a link to the shared playlist.
  6. Gift note: "Your presence is the present" with an optional link.
  7. Photo wall: 6 photos of Mia through the years in a playful tilted grid.
  8. RSVP: form (name, coming yes/no, plus-one, song request) with a thank-you message.
  9. Footer: "See you on the dance floor!"
- Look and feel: glamorous and fun: deep purple night background with gold and hot-pink accents, glitter gradients, disco-ball shine, confetti shapes (CSS), tilted photo frames, neon glow on buttons.
- Fonts: Monoton or Bungee for the big title, Poppins for text.
- Details: Saturday 21 November 2026, 20:00 until late, The Velvet Room, 14 King Street, Manchester. RSVP by 7 November.`,
  },
  {
    id: 'companyDinner',
    label: 'Company dinner party',
    icon: '🥂',
    brief: `- What the page is for: page for "Northwind Year-End Gala Dinner 2026", the company's annual dinner party. Goal: share the programme and collect attendance and meal choices.
- Who will read it: about 300 employees and their partners.
- Language of the text: English
- Sections, in this order:
  1. Header: company logo, links (Programme, Venue, Menu, Awards, RSVP) and an "RSVP" button.
  2. Hero: elegant photo of a candle-lit banquet hall, the event title, date and venue, the theme "A Night of Gold", and a live countdown.
  3. Welcome: a short note from the CEO with photo and signature.
  4. Programme: timeline (welcome drinks, dinner, awards ceremony, live band, after-party).
  5. Menu: 3 courses with a vegetarian option, shown as an elegant printed menu card.
  6. Awards: 6 award categories as cards (Team of the Year, Rising Star, Customer Hero…).
  7. Venue and travel: venue photo, address, shuttle bus times, parking and hotel discount.
  8. Dress code: "Black tie optional" with a short line.
  9. RSVP: form (name, department, attending, plus-one, meal choice, dietary needs) with a thank-you message.
  10. FAQ: 4 questions as <details>.
  11. Footer: contact of the organising team.
- Look and feel: classy and festive: deep navy and black with champagne-gold accents, art-deco line patterns (inline SVG), elegant serif headings, thin gold frames, soft spotlight glows.
- Fonts: Playfair Display for headings, Lato for text.
- Details: Friday 11 December 2026, 18:30, The Grand Ballroom, Hotel Meridian, Singapore. RSVP by 20 November.`,
  },
  {
    id: 'graduation',
    label: 'Graduation party',
    icon: '🎓',
    brief: `- What the page is for: graduation party page for "Leo's Class of 2026 celebration". Goal: invite family and friends and collect RSVPs.
- Who will read it: family, friends and classmates.
- Language of the text: English
- Sections, in this order:
  1. Hero: proud graduation photo, "Congratulations, Leo!" headline, degree and university, party date and a countdown.
  2. Leo's journey: 4 milestones with photos along a timeline (first day, study abroad, thesis, graduation).
  3. Party details: date, time, place, an "Open in Maps" link and parking info.
  4. What to expect: 3 cards (BBQ dinner, slideshow, live music).
  5. Messages for Leo: a guestbook-style section showing 3 sample notes, and a form to leave a message with a thank-you message.
  6. RSVP: form (name, guests, attending) with a thank-you message.
  7. Footer: "Thank you for being part of the journey".
- Look and feel: joyful and proud: navy blue and bright gold with white, confetti and star shapes (CSS), polaroid-style photos, bold rounded headings, cheerful hover bounces.
- Fonts: Fredoka for headings, Inter for text.
- Details: Saturday 27 June 2026, 17:00, the family garden, 8 Oak Lane, Austin. RSVP by 15 June.`,
  },
]
