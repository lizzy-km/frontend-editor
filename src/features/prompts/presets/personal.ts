import type { PromptPreset } from './types'

/** An online CV: shown with the portfolios. */
export const RESUME_PRESET: PromptPreset = {
  id: 'resume',
  label: 'Online CV',
  icon: '📄',
  brief: `- What the page is for: an online CV for "Daniel Okafor", a product designer looking for a new job. Goal: get recruiters to contact him or download the PDF CV.
- Who will read it: recruiters and hiring managers.
- Language of the text: English
- Sections, in this order:
  1. Header: name, job title, and links (Experience, Skills, Projects, Contact) plus a "Download CV" button.
  2. Intro: large photo in a soft rounded frame, a bold 3-sentence summary, location and a glowing "Open to work" badge.
  3. Experience: timeline of 4 jobs with role, company logo-style monogram, dates and 3 bullet points of results each (with numbers).
  4. Skills: grouped tags (Design, Research, Tools) and 4 skill bars that fill up when scrolled into view.
  5. Projects: 3 case study cards with a big image, problem, what he did and the result as one large number.
  6. Education and certificates: a short list.
  7. Languages: 3 languages with level.
  8. Contact: email, phone, LinkedIn link and a short message form with a thank-you message.
  9. Footer: name, © year.
- Look and feel: confident and modern: off-white page with a deep ink-navy sidebar-style intro, one vivid teal accent, oversized section numbers (01, 02…) in a light outline style, crisp cards with soft layered shadows, lots of air, easy to scan.
- Fonts: Sora for headings, IBM Plex Sans for text.
- Details: 8 years of experience, based in London, email daniel.okafor@example.com.`,
}

/** A wedding page: shown with the everyday pages. */
export const WEDDING_PRESET: PromptPreset = {
  id: 'wedding',
  label: 'Wedding',
  icon: '💍',
  brief: `- What the page is for: wedding website for "Sofia & James". Goal: share the day's details and collect RSVPs.
- Who will read it: family and friends, many on their phones.
- Language of the text: English
- Sections, in this order:
  1. Header: initials "S & J" in an elegant monogram and links (Our story, Schedule, Venue, Travel, RSVP).
  2. Hero: full-screen romantic photo of the couple with a soft ivory veil gradient, their names in a large script, date and place, and a live countdown to the wedding day in delicate boxes.
  3. Our story: 3 milestones (how we met, the proposal, the big day) with a photo each, alternating left and right along a thin gold line.
  4. Schedule: timeline of the day (ceremony, drinks, dinner, first dance, party) with times and small line icons.
  5. Venue: photo, address, an "Open in Maps" link and a parking note.
  6. Travel and stay: 3 hotel cards with distance and a booking link.
  7. Dress code and gifts: two short cards.
  8. RSVP: form (name, number of guests, attending yes/no, food preference, message) with a thank-you message.
  9. FAQ: 4 questions as <details> (kids, plus-ones, photos, transport).
  10. Footer: "We can't wait to celebrate with you", names, date.
- Look and feel: romantic, airy and luxurious: ivory and blush backgrounds, sage green and soft gold accents, delicate botanical line drawings (inline SVG) in the corners, thin gold dividers, generous spacing, gentle fade-in as you scroll.
- Fonts: Cormorant Garamond for headings, Great Vibes for the names, Lato for text.
- Details: Saturday 12 September 2026, 15:00, Villa Rosa, Lake Como, Italy. RSVP by 1 July 2026.`,
}
