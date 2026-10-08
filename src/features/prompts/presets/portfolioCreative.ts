import type { PromptPreset } from './types'

/** Portfolios for visual and creative work. */
export const CREATIVE_PORTFOLIO_PRESETS: PromptPreset[] = [
  {
    id: 'portfolioDesigner',
    label: 'Designer',
    icon: '🎨',
    brief: `- What the page is for: Personal portfolio of Mariana Napolitani, a UI/UX and web designer. Goal: show 3 flagship projects, explain her process and turn visitors into project enquiries. The page should feel like a dark, editorial, luxury magazine cover.
- Who will read it: founders, brands and agencies looking for a designer for a website or product.
- Language of the text: English
- Sections, in this order:
  1. Top strip: small caps "UI/UX & WEB DESIGNER" on the left and "CREATIVE PORTFOLIO" on the right.
  2. Hero: a huge, tall, high-contrast serif word "PORTFOLIO" spanning the full width in a warm beige, with a large portrait of the designer (dark bob haircut, sunglasses, black blazer, cut out) standing in front of the lower half of the letters so the word is partly covered. Left under the word: the line "I DESIGN DIGITAL EXPERIENCES THAT INSPIRE & CONNECT" in spaced capitals, a pill button "Available for projects" with a small sparkle icon, and her name "Mariana Napolitani" in a red script signature. Right: a short 3-line intro ("I'm a UI/UX and Web Designer crafting elegant, functional and user-centered digital experiences.") and "BASED IN ANY CITY / WORKING WORLDWIDE" with a circled globe icon. Dark red petals decorate the edges.
  3. Selected projects: a section heading "SELECTED PROJECTS" with a sparkle icon and a "VIEW ALL PROJECTS" link with an arrow on the right. Three equal bordered columns, each with a number (01, 02, 03), the project name (VELVET STUDIO - Branding & Web Design, AURORA SHOP - E-Commerce Design, MINDSPACE - Landing Page Design), a website screenshot (16:10, each in its own colour mood: burgundy, brown, dark red), and 3 small outlined tag chips (for example BRANDING, WEB DESIGN, UI/UX).
  4. Process and tools: two panels side by side. Left, "MY PROCESS": 5 numbered steps (01 Discover, 02 Define, 03 Design, 04 Develop, 05 Deliver), each with a one-line description, next to a round arc frame holding a dark red flower image and the italic words "A thoughtful process for meaningful results." Right, "TOOLS I USE": a 2-column by 4-row grid of dark tiles with a small coloured inline SVG badge and the name (Figma, Adobe XD, Photoshop, Illustrator, Webflow, Framer, Notion, Slack) and a small line "& MORE GREAT TOOLS".
  5. Kind words: heading "KIND WORDS"; three testimonial cards in a row, each with a large red quote mark, 2-3 lines of praise, a round avatar and a name with role (Sofia L., Founder, Velvet Studio / Daniel R., CEO, Aurora Shop / James T., Marketing Director).
  6. Contact: three columns. Left: "LET'S CREATE SOMETHING" with the word "Amazing" in a large red script. Middle: "I'M CURRENTLY OPEN FOR NEW PROJECTS", one sentence, and an outlined pill button "SEND ME A MESSAGE" (a mailto link). Right: a list with icons for email (hello@mariana-design.com), Instagram (@mariana.design) and location (Any City, Anywhere). A black-and-white portrait photo sits at the far right, overlapping the section edge.
  7. Footer: a full-width dark burgundy bar with centered small caps "THANK YOU FOR VISITING" and a sparkle icon.
- Look and feel: near-black background (#0d0909), cards in slightly lighter charcoal-brown (#1a1213) with 1px muted borders, warm beige (#d8b9a0) for the giant headline, deep burgundy (#6d1c2b) and rose-red (#a8323f) for accents, signature and quote marks, muted taupe for small text. Luxury fashion-editorial mood, lots of letter-spacing on small caps, thin lines, no bright colours, subtle grain or vignette on the hero.
- Fonts: Bodoni Moda (or Playfair Display) for the giant PORTFOLIO word, Cormorant Garamond for headings and quotes, Jost for small caps labels and body text, Pinyon Script for the signature and "Amazing".
- Details: the hero image is a cut-out style portrait (use a placeholder image and let it overlap the word with a higher z-index). On small screens stack everything in one column and reduce the giant word to fit the width without cutting letters.`,
  },
  {
    id: 'portfolioPhotographer',
    label: 'Photographer',
    icon: '📷',
    brief: `- What the page is for: Portfolio of Lena Hoffmann, an editorial and wedding photographer. Goal: let the photos lead and bring in booking enquiries.
- Who will read it: couples, magazines, brands and event planners.
- Language of the text: English
- Sections, in this order:
  1. Header: text logo "LENA HOFFMANN", minimal nav (Work, Series, About, Pricing, Contact), transparent over the hero.
  2. Hero: full-viewport image with a soft dark overlay, centered name, one line "Light, quiet moments and honest portraits" and a "View portfolio" link.
  3. Selected work: a masonry-style gallery of 9 images in mixed portrait and landscape ratios with a category filter row (All, Weddings, Editorial, Portraits, Travel) that works with vanilla JavaScript; each image has a small caption.
  4. Series: 3 large featured series blocks alternating image left and right, each with title, year, location and a 2-sentence story.
  5. About: a portrait of the photographer next to 2 short paragraphs and a signature-style name.
  6. Services and pricing: 3 packages (Portrait session, Wedding day, Editorial and commercial) with what is included and a "from" price.
  7. Press and clients: a row of 6 text-only publication names.
  8. Testimonials: 3 short client quotes with names.
  9. Contact: "Let's make something beautiful", a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, plus studio email, phone and city.
  10. Footer: social links as text and copyright.
- Look and feel: gallery minimalism; white or warm off-white background, near-black text, no coloured accent except a thin warm grey; images are the colour, large type for headings, square corners, plenty of whitespace, slow fade-ins.
- Fonts: Cormorant Garamond for headings, DM Sans for body text.
- Details: based in Hamburg, travels worldwide, booking calendar open for 2026, email hello@lenahoffmann.photo.`,
  },
  {
    id: 'portfolioFilmmaker',
    label: 'Filmmaker',
    icon: '🎬',
    brief: `- What the page is for: Portfolio of Kai Moreno, a filmmaker and video editor. Goal: show reels and projects and get commissions for brand films, music videos and documentaries.
- Who will read it: brands, agencies, musicians and production companies.
- Language of the text: English
- Sections, in this order:
  1. Header: text logo "KAI MORENO FILMS", nav links (Reel, Projects, Services, About, Contact).
  2. Hero: wide cinematic image (2.39:1 feel) with letterbox bars, a large play button graphic (decorative only), headline "Stories in motion" and the line "Director, cinematographer and editor". A "Watch the 2026 reel" button.
  3. Selected films: 6 cards with a 16:9 still, title, client, type and year; the first card is larger.
  4. Services: 4 items (Brand films, Music videos, Documentary, Editing and colour) with a short description.
  5. Process: 5 steps in a row (Brief, Treatment, Shoot, Edit and grade, Delivery).
  6. Behind the scenes: a strip of 4 still frames with short captions.
  7. Clients: 6 text-only client names.
  8. Testimonials: 3 quotes with name and company.
  9. Contact: "Have a story to tell?", a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, email and a response-time note.
  10. Footer: social links as text and copyright.
- Look and feel: cinematic; near-black (#0a0a0a) background, film-grain feel via subtle gradients, one amber accent (#e0a526), wide letterboxed images, uppercase tracked labels with thin lines, slow fade-in on scroll.
- Fonts: Bebas Neue for big headings, Inter for body text.
- Details: based in Los Angeles, available worldwide, email kai@kaimorenofilms.com, gear mentioned in one line (cinema camera, anamorphic lenses, DaVinci Resolve).`,
  },
  {
    id: 'portfolioIllustrator',
    label: 'Illustrator',
    icon: '🖌️',
    brief: `- What the page is for: Portfolio of Noor Ibrahim, an illustrator and character artist. Goal: show a recognisable style and win book, editorial and brand illustration commissions.
- Who will read it: publishers, magazines, game studios and brands.
- Language of the text: English
- Sections, in this order:
  1. Header: hand-lettered text logo "Noor", nav links (Work, Commissions, About, Shop, Contact).
  2. Hero: playful oversized h1 "Hello, I draw things", a short intro, two buttons ("See my work", "Commission me") and a collage of 4 overlapping artwork images with slight rotations.
  3. Selected work: a grid of 8 artworks (mixed sizes) with category chips filter (All, Books, Editorial, Characters, Brand) working with vanilla JavaScript.
  4. Style and process: 4 steps (Sketch, Ink, Colour, Polish) each with a small image and a line of text.
  5. Commissions: 3 packages (Spot illustration, Full-page illustration, Character sheet) with scope, turnaround and a "from" price.
  6. Clients and publications: 6 text-only names.
  7. About: portrait, 2 short paragraphs, and a list of favourite tools.
  8. Shop: 3 product cards (print, sticker pack, zine) with price and a "Buy" link.
  9. Testimonials: 2 quotes.
  10. Contact: "Got an idea?", a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, plus email and social handles as text.
  11. Footer: copyright and a hand-drawn style divider.
- Look and feel: warm, colourful and friendly; cream background (#fff6e8), deep ink-blue text (#1f2a44), coral (#ff6b57), mustard (#f4b942) and teal (#2a9d8f) accents, rounded corners, hand-drawn style borders and squiggle dividers drawn with inline SVG, slight tilts on cards.
- Fonts: Fraunces for headings, Nunito for body text.
- Details: based in Toronto, works with clients worldwide, usual turnaround 2-4 weeks, email hello@noor-draws.com.`,
  },
  {
    id: 'portfolioFashion',
    label: 'Fashion designer',
    icon: '👗',
    brief: `- What the page is for: Portfolio of Atelier Sora, an independent fashion designer. Goal: present collections and craftsmanship and attract buyers, stylists and press.
- Who will read it: boutiques, stylists, editors and private clients.
- Language of the text: English
- Sections, in this order:
  1. Header: wordmark "ATELIER SORA" centered, nav links on both sides (Collections, Lookbook, About, Press, Contact).
  2. Hero: a tall editorial image with the collection name "Autumn / Winter 2026" and a "View lookbook" link.
  3. Collections: 3 collection cards (Capsule, Ready-to-wear, Bridal) with cover image, season and short description.
  4. Lookbook: a gallery of 8 looks in portrait ratio with look numbers (Look 01 ...) and fabric notes on hover.
  5. Craft: a split section about materials and made-to-measure work with an image and 3 small facts (fabric sourcing, handmade hours, small batches).
  6. Designer story: portrait and 2 paragraphs.
  7. Press: 4 magazine names with a short quote each.
  8. Stockists and appointments: a list of 4 cities and a "Book a fitting" a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending.
  9. Footer: newsletter-style line without a form, social links as text and copyright.
- Look and feel: quiet luxury; ivory background (#f6f1ea), charcoal text, a muted clay accent (#a4684f), huge whitespace, thin lines, tall images, uppercase tracked small text, no shadows.
- Fonts: Bodoni Moda or Cormorant Garamond for headings, Jost for body text.
- Details: studio in Tokyo, ships worldwide, appointments by request, email studio@ateliersora.com.`,
  },
  {
    id: 'portfolio3d',
    label: '3D artist',
    icon: '🧊',
    brief: `- What the page is for: Portfolio of Theo Lindqvist, a 3D and motion designer. Goal: show animated work and get commissions for product visuals, title sequences and brand animation.
- Who will read it: agencies, tech brands, game studios and music artists.
- Language of the text: English
- Sections, in this order:
  1. Header: logo "TL", nav links (Work, Showreel, Services, About, Contact) and a "Hire me" button.
  2. Hero: dark hero with a bold h1 "3D that moves people", a short lead, a "Watch showreel" button and an abstract glossy 3D-style shape built with CSS gradients (no video needed).
  3. Selected work: 6 project cards with a rendered still (16:9), title, client, tools used (Blender, Cinema 4D, After Effects) and a hover zoom.
  4. Showreel: a large video-style frame with a decorative play button and runtime.
  5. Services: 4 items (Product visualisation, Motion graphics, Title sequences, Look development).
  6. Pipeline: 5 steps in a row (Concept, Model, Animate, Render, Composite).
  7. Tools: 8 tiles with the software names.
  8. Testimonials: 3 quotes.
  9. Contact: "Got a brief?", a contact form with labeled Name, Email and Message fields and a "Send message" button that shows a short thank-you message after sending, plus email.
  10. Footer: social links as text and copyright.
- Look and feel: futuristic and glossy; black background (#07070a), gradient accents from electric blue (#3a7bff) to magenta (#ff3ad4), glass-like cards with subtle blur and 1px light borders, large bold headings.
- Fonts: Unbounded or Space Grotesk for headings, Inter for body text.
- Details: based in Stockholm, works remotely, email theo@theolindqvist.com, typical project length 2-6 weeks.`,
  },
]
