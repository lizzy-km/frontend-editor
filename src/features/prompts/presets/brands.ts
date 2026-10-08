import type { PromptPreset } from './types'

/** Brand homepages and launches (the product launch "Nimbus" lives in business.ts). */
export const BRAND_PRESETS: PromptPreset[] = [
  {
    id: 'brand',
    label: 'Brand homepage',
    icon: '✨',
    brief: `- What the page is for: the homepage of "Halcyon", a sustainable lifestyle brand selling linen bedding and home textiles. Goal: make people fall in love with the brand and visit the shop.
- Who will read it: design-loving homeowners aged 25–45 who care about quality and sustainability.
- Language of the text: English
- Sections, in this order:
  1. Header: wordmark "HALCYON" in spaced capitals, links (Shop, Our story, Materials, Journal, Stores) and a "Shop now" button.
  2. Hero: full-screen lifestyle photo of a sunlit bedroom, a large serif headline about slow mornings, one line, "Shop the collection" button and a small scrolling marquee of values (Organic linen · Made in Portugal · Free returns).
  3. Brand promise: 3 icon cards (Natural materials, Fair making, Built to last).
  4. Collections: a bento grid of 5 collection tiles (Bedding, Bath, Table, Throws, Gift sets) with photo, name and "Explore" link, one tile twice as big.
  5. Story: split section, a tall photo of the makers on one side, the founder's short story and signature on the other.
  6. Materials: 3 columns explaining linen, cotton and wool with a texture photo each.
  7. Reviews: 3 customer quotes with stars, plus "4.9 out of 5 from 12,000 reviews".
  8. Instagram-style gallery: 6 square photos in a row with "@halcyonhome".
  9. Newsletter: "Get 10% off your first order" with an email field and a thank-you message.
  10. Footer: links in 4 columns, payment methods as text, social links, © year.
- Look and feel: calm luxury: warm oat and stone neutrals, deep olive accent, lots of white space, big editorial photos, thin rules, soft shadows, slow fade-ins.
- Fonts: Cormorant Garamond for headings, Manrope for text.
- Details: free shipping over $150, 100-night trial, stores in London and Lisbon.`,
  },
  {
    id: 'appLaunch',
    label: 'App launch',
    icon: '📱',
    brief: `- What the page is for: launch page for "Pocketplan", a mobile app that turns your to-do list into a calm daily plan. Goal: get downloads.
- Who will read it: busy professionals and students on their phones.
- Language of the text: English
- Sections, in this order:
  1. Header: app icon and name, links (Features, How it works, Pricing, FAQ) and a "Get the app" button.
  2. Hero: bold headline "Your day, beautifully planned", one line, App Store and Google Play buttons, rating "4.8 ★ from 20k reviews", and two tilted phone mockups (screenshots as images) floating over a soft gradient blob.
  3. Logos: "As featured in" with 5 publication names as text logos.
  4. Features: 6 cards in a bento grid with icon, title and one line, two of them larger with a screenshot.
  5. How it works: 3 steps with numbers and a phone screenshot each.
  6. Testimonials: a horizontal slider of 5 short reviews.
  7. Pricing: Free and Pro plans, Pro highlighted, monthly/yearly toggle buttons.
  8. FAQ: 5 questions as <details>.
  9. Final call: big gradient band with the headline and the store buttons.
  10. Footer: links, social, © year.
- Look and feel: playful and polished: white with a vivid indigo-to-pink gradient, glassmorphism cards, rounded 24px corners, floating shapes, smooth hover lifts.
- Fonts: Plus Jakarta Sans for everything.
- Details: free, Pro $4.99/month or $39/year, iOS and Android.`,
  },
  {
    id: 'fashionDrop',
    label: 'Fashion collection',
    icon: '🧥',
    brief: `- What the page is for: launch page for "NOIR/26", the autumn collection of the streetwear label "Kōdo". Goal: build hype for the drop and get sign-ups for early access.
- Who will read it: style-conscious 18–35 year-olds, mostly on phones.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "KŌDO", links (Collection, Lookbook, Drop, Stores) and a "Get early access" button.
  2. Hero: full-bleed black-and-white campaign photo, the collection name in giant condensed letters cut across the photo, drop date and a live countdown.
  3. Manifesto: one bold paragraph in large type.
  4. Lookbook: an asymmetric grid of 8 campaign photos with look numbers.
  5. Pieces: 6 product cards with photo, name, price and "Notify me" link; a second photo appears on hover.
  6. Behind the scenes: a wide photo band with a short quote from the designer.
  7. Early access: email form with a thank-you message and a note about limited quantities.
  8. Stores: 3 store cards with city and address.
  9. Footer: social links, © year.
- Look and feel: bold, raw and editorial: black and off-white with one neon acid-green accent, huge condensed headlines, grain texture, hard edges, underline hover effects, a running text marquee.
- Fonts: Anton for headlines, Inter for text.
- Details: drop on Friday 6 November 2026 at 18:00, pieces from $45 to $260.`,
  },
  {
    id: 'drinkBrand',
    label: 'Drinks brand',
    icon: '🥤',
    brief: `- What the page is for: homepage of "Fizzwell", a sparkling fruit-water brand with no sugar. Goal: get people to find it in stores or order a mixed pack.
- Who will read it: health-aware young adults and families.
- Language of the text: English
- Sections, in this order:
  1. Header: logo, links (Flavours, Why Fizzwell, Where to buy) and an "Order a pack" button.
  2. Hero: a bright colored background, a big can photo with fruit and bubbles around it, headline "All fizz. No sugar.", and two buttons.
  3. Flavours: 4 flavour cards (Lemon & Lime, Watermelon, Mango Passion, Berry Mix), each in its own bold color with a can photo and tasting notes.
  4. Why Fizzwell: 4 big numbers (0g sugar, 5 calories, 100% natural flavour, 12 recycled cans in every pack).
  5. Mix your pack: 3 pack options with price.
  6. Reviews: 3 quotes with stars.
  7. Where to buy: a list of 6 store names and an "Open store finder" link.
  8. Footer: social links, © year.
- Look and feel: juicy, sunny and fun: each section a different saturated fruit color, wavy section dividers (inline SVG), bubbly rounded shapes, bouncy hover effects, big friendly type.
- Fonts: Bricolage Grotesque for headings, Nunito for text.
- Details: 12-can mixed pack $18, free delivery over $30.`,
  },
  {
    id: 'skincareLaunch',
    label: 'Skincare launch',
    icon: '🧴',
    brief: `- What the page is for: launch of "Dew Serum", the first product of the skincare brand "Lumière Lab". Goal: get pre-orders.
- Who will read it: women and men aged 22–45 interested in simple, science-based skincare.
- Language of the text: English
- Sections, in this order:
  1. Header: logo, links (The serum, Ingredients, Results, FAQ) and a "Pre-order" button.
  2. Hero: soft studio photo of the bottle with water drops, headline about glass-like skin, price, "Pre-order" button and 3 small trust badges.
  3. Key ingredients: 3 cards (hyaluronic acid, niacinamide, ceramides) with a macro texture photo each.
  4. Results: before/after style photo pair and 3 big percentages from a 4-week study.
  5. How to use: 3 numbered steps.
  6. Reviews: 3 quotes from beta testers with photo.
  7. FAQ: 5 questions as <details>.
  8. Final call: price, "Pre-order" button, shipping date.
  9. Footer: links, © year.
- Look and feel: clean and luminous: pearl white and soft blush with a cool silver-blue accent, dewy gradients, rounded pill buttons, airy spacing, gentle shimmer on hover.
- Fonts: Fraunces for headings, DM Sans for text.
- Details: 30 ml, $38 (launch price $32), ships 1 December 2026.`,
  },
]
