import type { PromptPreset } from './types'

/** Small businesses: the most common reason people want a page. */
export const BUSINESS_PRESETS: PromptPreset[] = [
  {
    id: 'cafe',
    label: 'Café or restaurant',
    icon: '☕',
    brief: `- What the page is for: the website of "Juniper & Oak", a neighbourhood café and bakery. Goal: get people to visit, see the menu and book a table.
- Who will read it: locals, office workers nearby and weekend brunch visitors.
- Language of the text: English
- Sections, in this order:
  1. Header: logo text "Juniper & Oak", links (Menu, About, Hours, Find us) and a "Book a table" button.
  2. Hero: big warm photo of coffee and pastries, headline about slow mornings and fresh bread, one sentence, buttons "See the menu" and "Book a table".
  3. Highlights: 3 small cards (Baked every morning, Locally roasted coffee, Brunch until 3 pm), each with an icon.
  4. Menu: tabs for Breakfast, Lunch, Drinks; each tab lists 6 dishes with name, one-line description and price.
  5. About: photo on one side, the story of the owners in 2 short paragraphs on the other.
  6. Reviews: 3 short customer quotes with first name and star rating.
  7. Hours and location: opening hours table, address, phone, and a "Get directions" link to Google Maps.
  8. Footer: logo, social links as text, © year.
- Look and feel: warm and cozy, cream background, deep green and terracotta accents, rounded corners, lots of food photos.
- Fonts: Fraunces for headings, Inter for text.
- Details: Mon–Fri 7:00–17:00, Sat–Sun 8:00–15:00. 42 Linden Street, Portland. Phone (503) 555-0142. Flat white $4.50, avocado toast $12.`,
  },
  {
    id: 'shop',
    label: 'Product launch',
    icon: '🛍️',
    brief: `- What the page is for: launch page for "Nimbus", a quiet, foldable desk fan. Goal: get pre-orders.
- Who will read it: people working from home who want a calm, tidy desk.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "Nimbus", links (Features, Specs, Reviews, FAQ) and a "Pre-order" button.
  2. Hero: product photo, headline about cool air without the noise, price with launch discount, "Pre-order now" button, small line "Ships in March · 30-day returns".
  3. Features: 4 cards with icon, title and one sentence (whisper quiet, folds flat, 12-hour battery, USB-C).
  4. How it works: 3 numbered steps with a photo each (unfold, choose a speed, fold away).
  5. Colors: 3 color options shown as swatches with photo and name.
  6. Specs: a simple two-column table (size, weight, battery, noise, warranty).
  7. Reviews: 3 reviews with name, star rating and quote.
  8. FAQ: 5 questions as <details> (shipping, returns, warranty, charging, noise level).
  9. Final call: heading, price, "Pre-order now" button and a 7-day countdown to the end of the launch discount.
  10. Footer: logo, links, © year.
- Look and feel: clean and modern, white and soft grey, one bright sky-blue accent, big product photos, rounded 20px cards.
- Fonts: Manrope for headings and text.
- Details: regular price $89, launch price $69, colors Cloud, Slate and Sage.`,
  },
  {
    id: 'salon',
    label: 'Salon or services',
    icon: '💇',
    brief: `- What the page is for: website of "Lumen Studio", a hair and beauty salon. Goal: get people to book an appointment.
- Who will read it: women and men aged 20–55 in the area looking for a haircut, color or treatment.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "Lumen Studio", links (Services, Team, Prices, Gallery, Contact) and a "Book now" button.
  2. Hero: photo of a bright salon, headline about feeling like yourself again, one sentence and a "Book now" button.
  3. Services: 6 cards (Cut & style, Color, Balayage, Treatments, Bridal, Men's grooming) with photo, short text and "from" price.
  4. Price list: two columns of services with prices and durations.
  5. Team: 4 stylists with photo, name, specialty and years of experience.
  6. Gallery: 6 before/after style photos in a grid.
  7. Reviews: 3 quotes with first name.
  8. Contact: opening hours, address, phone, and a simple booking request form (name, phone, service, preferred day) with a thank-you message.
  9. Footer: logo, social links, © year.
- Look and feel: calm and elegant, off-white, blush pink and charcoal, thin lines, soft shadows.
- Fonts: Cormorant Garamond for headings, Jost for text.
- Details: Tue–Sat 9:00–19:00. Women's cut from $55, color from $85. 18 Rue Belle, Montréal.`,
  },
  {
    id: 'realestate',
    label: 'Home for sale',
    icon: '🏡',
    brief: `- What the page is for: a single-property page for a 3-bedroom house for sale. Goal: get serious buyers to book a viewing.
- Who will read it: families looking for a home in the area.
- Language of the text: English
- Sections, in this order:
  1. Header: agent name "Harbor Homes", links (Photos, Details, Neighbourhood, Contact) and a "Book a viewing" button.
  2. Hero: large photo of the house, address as the headline, price, and key facts row (3 bedrooms, 2 bathrooms, 1,850 sq ft, garden).
  3. Photos: gallery of 8 photos (living room, kitchen, bedrooms, garden) with a simple slider on phones.
  4. Description: 3 short paragraphs about the home.
  5. Details: two-column list (year built, heating, parking, lot size, taxes, HOA).
  6. Floor plan: one image with a caption.
  7. Neighbourhood: 4 cards (schools, parks, shops, transport) with walking times.
  8. Agent: photo, name, phone, email and a short contact form with a thank-you message.
  9. Footer: agency name, license number, © year.
- Look and feel: bright and trustworthy, white, navy and warm sand, big photos, clean lines.
- Fonts: Playfair Display for headings, Source Sans 3 for text.
- Details: 27 Maple Grove, Seattle. Price $749,000. Open house Saturday 11:00–13:00.`,
  },
]
