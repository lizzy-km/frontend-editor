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
- `CLAUDE.md` and `.claude/skills/*`: the rules for adding features (one
  branch per feature, small files, plain-language UI, how to verify).

Stack: Vite · React 19 · TypeScript · Zustand · Konva · Quill · Firebase (Auth + Firestore) · Cloudflare R2.

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
- Turn on **Analytics** in the Firebase console (Project settings →
  Integrations → Google Analytics) and copy the web app's measurement id.

## Known limits

- A saved page must fit in about 900 KB, the size of one Firestore document.
  Pages with huge embedded pictures can still be downloaded.
- Page JavaScript runs while editing, in a locked frame, so the editor looks
  like Preview. Clicks select things instead of using the page (buttons,
  tabs and sliders work in Preview).
- When you're focused inside Preview, Esc can't close it; use "Back to editing".
