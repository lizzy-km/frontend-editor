import type { PromptPreset } from './types'

/** Portfolios for developers, architects, writers, marketers and musicians. */
export const PROFESSIONAL_PORTFOLIO_PRESETS: PromptPreset[] = [
  {
    id: 'portfolioDeveloper',
    label: 'Developer',
    icon: '💻',
    brief: `- What the page is for: Portfolio of Arjun Mehta, a full-stack software engineer. Goal: show shipped products, technical depth and get recruiters and clients to reach out.
- Who will read it: hiring managers, engineering leads and startup founders.
- Language of the text: English
- Sections, in this order:
  1. Header: monogram logo "AM", nav links (Work, Skills, Experience, Writing, Contact) and a "Download CV" outline button.
  2. Hero: eyebrow "Full-stack engineer, Berlin", h1 about building fast, reliable products, one-line lead, two buttons ("View projects", "Contact me"), and a code-window card on the right showing a short, decorative snippet (plain text in a styled pre).
  3. Stats: 4 tiles (years of experience, products shipped, open-source stars, uptime).
  4. Featured projects: 4 project cards, each with a screenshot, title, a 2-line problem and result description, tech-stack chips and two links ("Live demo", "Source").
  5. Skills: grouped lists in 4 columns (Frontend, Backend, Cloud and DevOps, Tooling), each skill as a chip.
  6. Experience: a vertical timeline with 4 roles (company, title, dates, 2 bullet achievements with numbers).
  7. Open source and writing: 3 article or repository cards with title, one line and a date.
  8. Testimonials: 2 quotes from a former manager and a client.
  9. Contact: heading "Let's build something", one sentence, a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, and links to email, GitHub and LinkedIn.
  10. Footer: copyright and a "Back to top" link.
- Look and feel: dark developer aesthetic, near-black blue background (#0b1020), electric green (#3ddc97) accent, subtle grid-line background, monospace labels, card borders 1px with soft glow on hover, no stock-photo feel.
- Fonts: JetBrains Mono for labels and code, Space Grotesk for headings, Inter for body text.
- Details: email arjun@arjunmehta.dev, available for freelance from next month, response time under 24 hours.`,
  },
  {
    id: 'portfolioArchitect',
    label: 'Architect',
    icon: '🏛️',
    brief: `- What the page is for: Portfolio of Studio Norra, an architecture and interior design practice. Goal: present built projects with credibility and attract residential and commercial clients.
- Who will read it: homeowners, developers, hotels and restaurant owners.
- Language of the text: English
- Sections, in this order:
  1. Header: studio wordmark "NORRA", nav links (Projects, Studio, Services, Journal, Contact) and an "Enquire" button.
  2. Hero: very large image of a building, with the studio statement "Spaces shaped by light, material and the people who use them" in a big thin heading and a scroll hint.
  3. Selected projects: 6 project cards in a 2x3 grid, each with image, name, location, year and type (Residential, Hospitality, Workplace); an index list on the side with project names.
  4. Featured case study: one project in depth with a large image, a facts column (location, area, year, team, status) and a 3-step story (Brief, Design, Result).
  5. Services: 4 items (Architecture, Interior design, Master planning, Project management) each with a short description.
  6. Approach: 4 numbered principles in a row.
  7. Numbers: 4 stats (projects completed, years of practice, awards, team size).
  8. Awards and press: a simple list of 5 awards with year and publication.
  9. Team: 4 people with portrait, name and role.
  10. Contact: "Start a project", short text, a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, office address and phone.
  11. Footer: studio details, social links as text, copyright.
- Look and feel: architectural and calm; warm concrete grey and white palette (#f1efea, #1c1c1a), one terracotta accent (#b5583a), thin 1px structural lines, big images with generous gaps, grid-aligned layout, uppercase tracked small labels.
- Fonts: Archivo (wide) for headings, Inter for body text.
- Details: studio in Copenhagen, founded 2012, team of 14, email studio@norra.dk.`,
  },
  {
    id: 'portfolioWriter',
    label: 'Writer',
    icon: '✍️',
    brief: `- What the page is for: Portfolio of Priya Raman, a freelance writer, copywriter and journalist. Goal: show credibility through bylines and clear writing samples and win commissions.
- Who will read it: editors, content leads, brands and start-ups.
- Language of the text: English
- Sections, in this order:
  1. Header: text logo "Priya Raman", nav links (Writing, Services, About, Press, Contact).
  2. Hero: a confident text-led hero (no image needed): h1 "Words that make people stop scrolling", a short intro, and two buttons ("Read my work", "Hire me"); a small line of publication names below.
  3. Selected writing: 6 article cards with publication, title, a 2-line excerpt, date and a "Read" link; filter chips (All, Journalism, Brand, Long-form, Newsletters).
  4. Case studies: 2 copywriting results with a short problem, what was written and a number (for example conversion up 38 percent).
  5. Services: 4 items (Articles and features, Brand copy, Newsletters, Editing and ghostwriting) each with a short description and typical turnaround.
  6. About: a portrait with 2 paragraphs in first person and a short list of beats and topics.
  7. Press and clients: a row of 8 text-only publication and brand names.
  8. Testimonials: 3 quotes from editors and clients.
  9. Newsletter and contact: a short invitation, a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, plus email.
  10. Footer: social links as text and copyright.
- Look and feel: editorial and literary; warm off-white paper background (#faf7f2), near-black ink text, one deep green accent (#1f5c4d), thin rules, very readable column widths, drop-cap on the first paragraph of About.
- Fonts: Newsreader or Source Serif 4 for headings and body text, Inter for small labels.
- Details: based in Mumbai, works in English, rates on request, email priya@priyaraman.com. Use realistic but obviously sample article titles.`,
  },
  {
    id: 'portfolioMarketer',
    label: 'Marketer',
    icon: '📈',
    brief: `- What the page is for: Portfolio of Elena Vasquez, a growth and brand marketing consultant. Goal: prove results with numbers and book discovery calls.
- Who will read it: SaaS and e-commerce founders and marketing leads.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "Elena Vasquez", nav links (Results, Services, Case studies, Process, About, Contact) and a "Book a call" button.
  2. Hero: h1 about turning marketing into measurable growth, one-line lead, a "Book a call" button and 3 proof stats (revenue generated, brands helped, average ROI).
  3. Trusted by: a row of 6 text-only brand names.
  4. Results: 3 big metric cards (for example +212 percent organic traffic, 3.4x return on ad spend, 41 percent lower acquisition cost) each with the client type and time frame.
  5. Services: 4 cards (Growth strategy, Paid media, SEO and content, Lifecycle and email) with a short description and deliverables.
  6. Case studies: 3 cards with logo-style text, the challenge, the approach and the result.
  7. Process: 4 steps (Audit, Strategy, Execute, Optimise).
  8. About: portrait with 2 paragraphs and a list of certifications.
  9. Testimonials: 3 client quotes with name and company.
  10. FAQ: 5 <details> items (engagement models, minimum budget, timeline, reporting, industries).
  11. Contact: "Book a free 30-minute call", a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending.
  12. Footer: social links as text and copyright.
- Look and feel: confident and clean; white background, deep navy text (#0f1b3d), one vivid violet accent (#6c4cf1) with a soft gradient on key buttons and metric numbers, rounded cards with light shadows, large numerals.
- Fonts: Manrope for headings, Inter for body text.
- Details: based in Madrid, works remotely with clients in Europe and the US, email elena@elenavasquez.co. Use sample numbers only.`,
  },
  {
    id: 'portfolioMusician',
    label: 'Musician',
    icon: '🎵',
    brief: `- What the page is for: Portfolio and press page of Nova Reyes, a singer-songwriter and live performer. Goal: introduce the music, show live dates and make it easy to book her.
- Who will read it: fans, venue bookers, festival programmers and music journalists.
- Language of the text: English
- Sections, in this order:
  1. Header: text logo "NOVA REYES", nav links (Music, Live, Gallery, Press, Booking).
  2. Hero: moody full-width image with an overlay, huge name as the headline, tagline "Dream pop for late-night drives", and two buttons ("Listen now", "Booking").
  3. Music: a featured latest single card with cover art, title and a "Play" button (decorative), plus a list of 5 tracks with duration and a fake play icon drawn in inline SVG.
  4. Live: an upcoming-dates table with date, city, venue and a "Tickets" link for 5 shows.
  5. Gallery: 6 live and press photos in a tight grid.
  6. About: portrait and a 3-paragraph artist bio.
  7. Press: 3 quotes from magazines with the publication name.
  8. Epk and booking: a rider summary (band size, set length, stage needs) and a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, plus the booking agent email.
  9. Footer: streaming and social links as text and copyright.
- Look and feel: nocturnal and atmospheric; deep indigo-black background (#0c0a1d), neon pink (#ff4fa3) and cyan (#4fe3ff) glow accents, blurred gradients, grain-like gradients, large condensed headings, a little glow on hover.
- Fonts: Syne for headings, Inter for body text.
- Details: based in Mexico City, debut album "Neon Static" out 2026, booking@novareyes.com. Use sample dates and venues.`,
  },
]
