import type { PromptPreset } from './types'

/** Pages about a person: show work, find a job, celebrate. */
export const PERSONAL_PRESETS: PromptPreset[] = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: '🎨',
    brief: `- What the page is for: portfolio of "Maya Lin", a freelance illustrator. Goal: get new clients to get in touch.
- Who will read it: art directors, publishers and small brands looking for an illustrator.
- Language of the text: English
- Sections, in this order:
  1. Header: name as logo, links (Work, About, Services, Contact).
  2. Hero: short intro line "Illustrations that tell a story", one sentence about style, and a "See my work" button; a featured artwork beside it.
  3. Work: grid of 9 projects with image, title and client, filter buttons (All, Books, Brands, Editorial).
  4. About: portrait photo and 2 short paragraphs, plus a list of past clients.
  5. Services: 3 cards (Book covers, Brand illustration, Editorial) with what's included and "from" price.
  6. Process: 4 numbered steps from brief to final files.
  7. Testimonials: 2 client quotes.
  8. Contact: email link, social links and a short contact form with a thank-you message.
  9. Footer: name, © year.
- Look and feel: playful but clean, white background, one bold coral accent, generous whitespace, artwork first.
- Fonts: Syne for headings, DM Sans for text.
- Details: based in Lisbon, works worldwide, email hello@mayalin.studio.`,
  },
  {
    id: 'resume',
    label: 'Online CV',
    icon: '📄',
    brief: `- What the page is for: an online CV for "Daniel Okafor", a product designer looking for a new job. Goal: get recruiters to contact him or download the PDF CV.
- Who will read it: recruiters and hiring managers.
- Language of the text: English
- Sections, in this order:
  1. Header: name, job title, and links (Experience, Skills, Projects, Contact) plus a "Download CV" button.
  2. Intro: photo, a 3-sentence summary, location and "Open to work" badge.
  3. Experience: timeline of 4 jobs with role, company, dates and 3 bullet points of results each.
  4. Skills: grouped tags (Design, Research, Tools) and 4 skill bars with labels.
  5. Projects: 3 case study cards with image, problem, what he did and the result.
  6. Education and certificates: a short list.
  7. Languages: 3 languages with level.
  8. Contact: email, phone, LinkedIn link and a short message form with a thank-you message.
  9. Footer: name, © year.
- Look and feel: professional and calm, white and slate grey with a teal accent, lots of whitespace, easy to scan.
- Fonts: IBM Plex Sans for everything.
- Details: 8 years of experience, based in London, email daniel.okafor@example.com.`,
  },
  {
    id: 'wedding',
    label: 'Wedding',
    icon: '💍',
    brief: `- What the page is for: wedding website for "Sofia & James". Goal: share the day's details and collect RSVPs.
- Who will read it: family and friends, many on their phones.
- Language of the text: English
- Sections, in this order:
  1. Header: initials "S & J" and links (Our story, Schedule, Venue, Travel, RSVP).
  2. Hero: romantic photo of the couple, names, date, place, and a live countdown to the wedding day.
  3. Our story: 3 milestones (how we met, the proposal, the big day) with a photo each.
  4. Schedule: timeline of the day (ceremony, drinks, dinner, first dance, party) with times.
  5. Venue: photo, address, a "Open in Maps" link and a parking note.
  6. Travel and stay: 3 hotel cards with distance and a booking link.
  7. Dress code and gifts: two short cards.
  8. RSVP: form (name, number of guests, attending yes/no, food preference, message) with a thank-you message.
  9. FAQ: 4 questions as <details> (kids, plus-ones, photos, transport).
  10. Footer: "We can't wait to celebrate with you", names, date.
- Look and feel: romantic and light, ivory, sage green and soft gold, delicate lines, elegant spacing.
- Fonts: Cormorant Garamond for headings, Lato for text.
- Details: Saturday 12 September 2026, 15:00, Villa Rosa, Lake Como, Italy. RSVP by 1 July 2026.`,
  },
]
