# Tweak — edit any web page without code

Got a web page from ChatGPT, Claude or Gemini? Paste it in, click what you
want to change, and download it again. **Tweak** (working name) is made for
everyday people who aren't coders or designers.

- **Paste anything.** Paste the whole AI reply; the code fences and chatter
  are removed for you. Full pages, fragments, separate HTML/CSS/JS, `.html`
  files and Tailwind pages all work.
- **Click and change it.**
  - Double-click text to type, drag things to move them, and pull the
    handles to resize.
  - Change a picture from your computer or a link.
  - The settings panel uses everyday words ("Text size", "Space inside",
    "Round corners") and hides the rest under "More options".
- **Every screen size.** Switch between Computer, Tablet and Phone. An edit
  made on Phone only changes phones.
- **Download it.** Get a single `.html` file, a `.zip` with HTML/CSS/JS
  files, or a `.png` picture, for the whole page or only the selected part.
  Preview runs the page's own JavaScript safely.
- **Accounts (optional).**
  - Save up to 10 pages (free plan), with autosave and thumbnails.
  - Share a page publicly, browse other people's pages in Explore, and make
    your own copy.
- **Coming later** (switched off): paid plans with crypto payment, and a P2P marketplace.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Open **/try**. Everything works without an account, and your page is kept in this browser.

## Turning on accounts (Firebase)

1. Create a Firebase project and add a **Web app**.
2. **Authentication** → enable **Email/Password**, and **Google** and
   **GitHub** if you want them. Add your domain under *Authorized domains*.
3. **Firestore Database** → create it (production mode).
4. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values from
   the web app config.
5. Deploy the security rules and indexes. **The rules are what enforce the
   10-page limit and privacy**, so don't skip this step:
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use <your-project-id>
   firebase deploy --only firestore
   ```

## Turning on picture uploads (Cloudflare R2)

Without this, pictures under 400 KB are embedded in the page and bigger ones need a link.

```bash
cd workers/assets
npm install
npx wrangler login
npx wrangler r2 bucket create tweak-assets
# edit wrangler.toml: FIREBASE_PROJECT_ID and ALLOWED_ORIGINS (your app's URL)
npm run deploy
```

Put the Worker's URL in `.env` as `VITE_ASSETS_URL`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build (`dist/`) |
| `npm run lint` | ESLint (also enforces ≤150 lines per file, ≤100 per function) |
| `npm test` | Unit tests (vitest) |
| `npm run e2e` | Browser checks on your local Chrome. Start `npx vite --port 5317` first |
| `npm run test:rules` | Firestore security-rules tests. Needs Java + `firebase-tools` |
| `cd workers/assets && npm run check` | Worker typecheck + dry-run build |

## Project guide

- `docs/ARCHITECTURE.md`: how the pieces fit together (page model, iframe
  renderer, Konva overlay, saving, data).
- `docs/HISTORY.md`: what each feature branch added, and why.
- The in-app user guide lives at `/guide` (quick) and `/guide/full`; its text is
  in `src/features/guide/content/`. Update it when a feature changes.
- `CLAUDE.md` and `.claude/skills/*`: the rules for adding features (one
  branch per feature, small files, plain-language UI, how to verify).

Stack: Vite · React 19 · TypeScript · Zustand · Konva · Quill · Firebase (Auth + Firestore) · Cloudflare R2.

## One page or a whole website

Choose "One page" or "A website with several pages" when you start (or turn
a page into a website later). A website has a Pages tab, a header and footer
shared by every page, "Go to a page" links and "Click goes to" boxes. Its
React download is a routed app (React Router or TanStack Router) with a
shared Layout, one file per page, and route guards for pages only some
people may open.

Under **Pages → Add sign-in pages** you get Log in, Create account, Forgot
password, Set a new password and Confirm email pages. They are normal pages:
change any word or color. In the React download they really work (demo
accounts and a pretend email until you connect your API).

**Pop-ups and questions:** add a Pop-up (a button plus the box), choose what a
button opens or closes under "When clicked", and make any button or link ask
"Are you sure?" first. They work in Preview, downloads and the React project.

**Layouts:** under Pages → Layout pick a top bar, a side menu or both. The menu
is made from your pages and hides items visitors may not open; on phones it
becomes a ☰ button. Log in, Sign up and Log out are added when you have a Log in page.

**Screen layout:** a slim rail on the left (Layers, Add, Pages, Design, Data, Code)
and, for the selected thing, three tabs on the right: Design (how it looks),
Actions (what it does) and More.

**Colors:** the Colors tab lists every color of your project. Change one and it
changes everywhere; colors defined as CSS variables (theme colors) come first.

## Data on any box

Under Actions → Data, make any box show your data: **every item** (a list of
cards) or **one item**. "Fill in the fields for me" connects the pictures and
text. For a page per item (`/product/3`), add a **Detail page** (Pages → Add a
page) and set your cards to open it: Actions → Data → On click → Open page. Pages
have a **Show in the menu** switch (off by default) for the top bar / side menu,
and Preview has **Viewing as** to test visitors, members and admins.

## Who can see what

"Who can see this" shows an element or page to everyone, signed-in people
(optionally with some roles) or signed-out visitors, and can require feature
flags. "Viewing as" in the toolbar shows the page as each of them. The React
download gets real sign-in code for any API (set the addresses under
**Sign-in API** in the Data tab) and a demo mode with sample accounts until
you switch to your API.

## Data

The Data tab holds lists your page can show (products, posts, team…):
typed fields, sample rows (type them, **import from JSON**, or **connect your API** and test it live), and an optional API key that your project reads from `.env`. The React download turns them
into TypeScript types, a mock data file and React Query + axios hooks, using
the sample rows until you switch to the real API.

## Ready-made components

- **Contact form / Sign-up form**: set rules per box (must be filled in, limits,
  "same as"), choose where answers are sent. Works in Preview and downloads; the
  React download uses React Hook Form + Zod, one component per form.
- **List from data**: one card design filled from a data source; in the React
  download it loads page by page as visitors scroll (React Query + a ready-made
  InfiniteScroll).
- **Animation box** (and an Animation section on everything): fade, slide,
  zoom, flip or unblur on scroll, load, hover or in a loop, one by one if you
  like. The React download uses Motion.
- **Inputs, tabs, calendar, tables, search and filters** (Add panel): text, email, password,
  number, text area, switch, select (with search), date picker, calendar, four kinds of tabs, a
  dropdown menu, tables (typed, or **from data**), a **search bar** and **filters** that narrow a
  "List from data" or a table (a filter can offer a data field's real values). They work in Preview
  and downloads; the React download gets one small script, `src/widgets.ts`.

## Seeing the React code

In the Code tab, **React (TSX)** shows the real React component for whatever you
selected (and every other component in a picker), ready to copy. Plain markup
can be edited and applied to the page; components with code stay read-only.

## Downloads

Web page (.html), files for a developer (.zip), a **React project** (.zip:
Vite + React + TypeScript, one component per part of the page, repeated
cards as one component with a data list), a picture (.png), or copy the code.

A React download can be **opened again**: on the start screen choose "Open a .zip" or
"Choose a folder". A hidden `.tweak/project.json` inside the download brings the page
back exactly; files edited outside Tweak are listed first (Tweak rebuilds the project
from the page, so those edits would not carry over). Folders from other sources can't be
opened. `node_modules`, `.git` and `dist` are ignored, so there is no need to delete them first.

## No code yet?

The paste screen has a folded "No code yet?" helper: pick one of 35
ready-made page ideas in four groups (business, brands & launches, events
& celebrations, portfolios) or start blank, change the description in your own
words, copy the prompt into ChatGPT, Claude or Gemini, and paste the
answer back. The prompt's rules make the AI write pages that are easy to
edit here.

## Search engines and link previews (SEO)

- Every public screen has its own title, description, share tags and structured data, listed in
  `src/config/seoRoutes.ts`. Account, editor and sign-in screens are `noindex`. Moving around the app keeps the
  page head right (`RouteSeo`).
- `vite build` also writes a static copy of each public page (`dist/guide/index.html`…) with its own head and a
  no-script summary, plus `robots.txt` and `sitemap.xml`, so crawlers and link previews that don't run scripts
  see real content.
- **Set `VITE_SITE_URL`** (for example `https://tweak.example`) where you build. Without it the canonical links,
  share picture and sitemap are left out (the build says so).
- The share picture and icons are made by `node scripts/seo/make-images.mjs` (needs Chrome, writes to `public/`).
- Pages people share from their account are not indexed by default (`INDEX_SHARED_PAGES` in `src/config/seo.config.ts`).

## Usage stats

Google Analytics for Firebase counts screens and actions (paste, edits by
kind, downloads by format, sign-ups) so we know what to improve. It never
sends page content, code or what people type.

- On only when `VITE_FIREBASE_MEASUREMENT_ID` is set, in production builds
  (`VITE_ANALYTICS_IN_DEV=1` sends from `vite dev` to DebugView).
- Off under Do Not Track / Global Privacy Control, and with the
  "Share usage stats" switch in the account menu.
- No advertising features (Google signals and ad personalization are off).
- The events and their parameters: `src/features/analytics/events.ts`.
- On Vercel, Vercel Web Analytics also counts page views (cookieless,
  same opt-out, page ids removed). Turn it on in the Vercel project's
  Analytics tab.
- Speed from real visits: Core Web Vitals (`web_vital`: LCP, INP, CLS, FCP,
  TTFB, with a good / needs-improvement / poor rating per screen).
- Google Consent Mode v2: analytics allowed, every ad signal denied.
- Turn on **Analytics** in the Firebase console (Project settings →
  Integrations → Google Analytics) and copy the web app's measurement id.
- In Google Analytics, mark `sign_up`, `page_create` and `download` as **key
  events**. A useful funnel (Explore → Funnel): `paste_code` → `edit` →
  `download`. Register `action`, `format`, `metric_name`, `rating` and
  `where` as custom dimensions to break reports down by them.

## Known limits

- A saved page must fit in about 900 KB, the size of one Firestore document.
  Pages with huge embedded pictures can still be downloaded.
- Page JavaScript runs while editing, in a locked frame, so the editor looks
  like Preview. Clicks select things instead of using the page (buttons,
  tabs and sliders work in Preview).
- When you're focused inside Preview, Esc can't close it; use "Back to editing".
