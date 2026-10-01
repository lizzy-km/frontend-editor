# History

One entry per feature branch, newest first. Each branch is merged into `main`
with `--no-ff`, so `git log --first-parent main` shows one merge per feature.

## feature/web-vitals — 2026-10-01
- Core Web Vitals from real visits (`web_vital`, ~3 kB gzipped, lazy).
- More events: `auth_error` (Firebase code only), `add_block`,
  `picture_add` (upload/embed), `text_editor_open`, `page_rename`.
- Consent Mode v2 defaults (ad signals denied). README lists the key events,
  funnel and custom dimensions to set up in Google Analytics.
- Firebase Performance Monitoring was left out on purpose: Web Vitals cover
  page speed for a fraction of the size, and Firestore Lite calls are plain
  fetches the editor already handles.

## feature/analytics — 2026-10-01
- **Google Analytics for Firebase**, lazy-loaded (its own 6 kB gzipped chunk,
  after the page is idle; the first load and sign-in pages are unchanged).
- Events (`analytics/events.ts`): page views (ids removed), errors and
  crashes, sign-up/login/logout by method, paste (counts only) and rejected
  pastes, edits by kind (one per undo step), code edits by box, undo/redo,
  screen-size switch, preview, page create/delete/limit/share, downloads by
  format/scope and blocked downloads. User properties: plan, signed in.
- Privacy: no content, code, names or page ids; no ad signals; respects Do
  Not Track / GPC; "Share usage stats" switch in the account menu. Nothing
  is sent from `vite dev` unless `VITE_ANALYTICS_IN_DEV=1`.
- Checked on the production build with Google blocked and Firebase answers
  faked: events reach gtag with the right names; opting out loads nothing.

## fix/render-fidelity — 2026-10-01
- **The editor now looks like Preview.** Pages whose scripts draw or reveal
  parts (scroll-reveal text, JS-drawn clock ticks, countdowns) looked broken
  while editing, because page JS was off.
  - The editor frame runs the page's own scripts in a locked frame
    (`sandbox="allow-scripts"`, no same-origin). The editor talks to it by
    postMessage (`frame/bridge.ts`) and a runtime inside the frame
    (`frame/runtime/`) that patches, measures, hit-tests, works out drop
    slots, reads computed styles and takes PNGs.
  - Removed: the in-app frame renderer, the shell document and the
    "trusted scripts" allowlist (`model/scripts.ts`).
- **CSS `@import` fix**: Google Fonts URLs contain `;`, which cut the import
  and broke the whole stylesheet (editor, Preview and exports). A small
  scanner (`serialize/cssImports.ts`) now hoists `@import`/`@charset`.
- Tests: runtime in jsdom (`frame/editorFrame.test.ts`). The e2e
  `fidelity.mjs` compares the editor with the original page (elements, height,
  hidden text) for the samples in `codeToNodeTestCodeFiles/`. The e2e box helper
  applies the canvas zoom (Playwright ignores it for the sandboxed frame).
  `pasteCode()` fills big pages instantly.

## feature/collapsible-code — 2026-09-30
- **Collapsible code boxes** (`sidebar/code/CodeSection`): Page code,
  Styles and each Script have a header to collapse or expand them. The
  header shows the size ("15 lines").
  - Open/closed is remembered in this browser. Page code starts open; the
    others start closed.
  - A box loads its editor on first open and only hides afterwards, so
    unapplied code survives a collapse.
- **Page code = the whole page** (`serialize/editableSource.ts`): head
  (title, meta, links, scripts), `<style>` with the page CSS, the body, and
  body scripts. Applying it re-reads everything, so HTML, CSS and JS update
  together and the Styles and Script boxes follow.
  - It round-trips exactly. Body, scripts and closing tags are written
    unbroken, because the HTML parser moves any whitespace there into the
    body, and re-applying would otherwise add blank lines every time.
- **Edit code on a part**: a `<style>` or `<script>` inside the snippet now
  joins the page's CSS or JS (`parse/snippetAssets.ts`) instead of being dropped.
- **Fold all** (`foldSections`) keeps `<html>`, `<head>` and `<body>` open
  and folds the `<style>` block and each section, instead of collapsing the
  page to one line.
- Tests: 51 unit tests (round trip, CSS/JS through page code, part assets)
  and 89 of 89 e2e.

## feature/edit-html — 2026-09-30
- **Edit the pasted code itself**, not just its CSS and scripts:
  - **Page HTML** at the top of the Code tab: the whole page as HTML in
    CodeMirror (html mode), with **Apply changes** / **Discard**.
  - **Edit code** on the quick-actions bar: the selected part's HTML in a
    dialog, handy for pasting a fixed section from an AI.
  - Either way, applying is one undo step and the result gets selected.
    Code fences around pasted code are removed.
- Lossless round trip (`nodeToHtml` with `forEditing`):
  - Computer-view edits are written as `style="…"`.
  - Hidden parts are marked `data-fe-hidden`, and the parser reads it back
    to `hidden`.
  - Tablet and phone-only edits can't be written as HTML, so a warning shows
    before applying.
- It applies on demand, not per key press, because rebuilding the page on
  every key would lose the selection and undo.
- **Fold / unfold** in every code box: clear arrows in the gutter, a `…` pill
  on folded blocks, and **Fold all** / **Unfold all** buttons
  (`@codemirror/language`). The Page HTML box folds down to the page's
  main sections.
- Tests: unit `codeActions.test.ts` (5, including an unchanged round trip)
  and e2e `edit-code.mjs` (13). The suite is 86 of 86, plus 48 unit tests.

## feature/download-limit — 2026-09-30
- **10 downloads per page per calendar month** on the free plan; Pro is
  unlimited (`plans.ts` `maxDownloadsPerMonth`, mirrored in `maxDownloads()`
  in the rules).
- Every export counts: .html, .zip, .png and "Copy the code".
- Saved pages keep a server counter on `tweaks_projects/{id}`:
  `downloadPeriod` (e.g. `202609`, UTC) and `downloadCount`.
  - `recordDownload` is a transaction. The rules allow the owner only +1
    this month, within the plan, and a new month restarts at 1.
  - A new page can't be created with a download count, and nobody can reset
    or skip the count.
- The Download dialog prepares the file, then records the download, then
  delivers it, so a failed export never uses one up.
  - It shows "N of 10 downloads left this month", and when the limit is
    reached, the date downloads start again.
- **Try-it:** downloading needs a free account. The dialog offers sign-up,
  which comes back to "Save the page from Try it". Preview still works.
- **Shared pages** no longer have a direct Download. Visitors make their own
  copy, which follows their own limit.
- Export stays independent of Firestore: pages pass a `DownloadGate`
  (`signin` / `counted` / `open`).
- **Fixed along the way:** Esc didn't close dialogs in the editor, because
  the editor's Esc shortcut took the key. Shortcuts now step aside while a
  dialog is open.
- Caveat: files are generated in the browser from code the user pasted, so
  a technically savvy user can always get the code out. The limit stops
  normal use; it can't be tamper-proof. The counter itself can't be faked.
- Tests: rules `downloads.test.ts` (6 cases, 19 of 19 in total), unit tests
  `downloads.test.ts`, and e2e updates (78 of 78). Browser checks use a
  dev-only Try-it allowance (`allowTryDownloads`), which is stripped from
  production builds.

## fix/retirement-page — 2026-09-30
A real AI page (`e2e/fixtures/retirement.html`: SVG symbols, `<details>` FAQ,
a form, heading lines made of spans, head meta) exposed these bugs:
- **Clicks selected the wrong element.** In-page `scrollIntoView()` also
  scrolled the editor's `overflow: hidden` page wrapper, shifting the page
  about 20 px under the overlay. The canvas and page wrappers now use
  `overflow: clip`, which can't be scrolled at all.
- **Editing a whole heading merged its lines.** Quill drops bare
  `<span>`s, classes on links, `small`/`mark`, per-element edits, and
  anything inside SVG. `isTextEditable` now opens Quill only when every
  inline piece survives the round trip; otherwise the Words list is used.
  Single spans are still editable on their own.
- **FAQ answers couldn't be reached.** Selecting a question, or anything
  inside a `<details>`, now opens it in the editor only
  (`useRevealDetails`); the model and export are untouched.
- **Raw tag names** such as "DT" and "SUMMARY": many more everyday names
  (`labels/tagLabels.ts`), and unknown tags read "Page part (tag)".
- **The export dropped head tags.** `viewport-fit=cover`, description,
  preconnect and icons are now kept (`PageDoc.headTags`, optional). The page's
  viewport replaces the default; `http-equiv` refresh is never copied.
- New: a "Hint text" (placeholder) field for input and text boxes.
- Checked and fine: the export matched the original pixel for pixel in
  height (7321 px); fonts, SVG `<use>` icons and the script all work.
- e2e: `real-page.mjs` (14 checks); the full suite is 74 of 74.

## feature/codemirror — 2026-09-29
- The Code tab (page CSS and inline scripts) now uses CodeMirror 6, with
  syntax colors, line numbers, brackets, search (Ctrl/⌘+F) and its own undo.
- Its theme uses the app's CSS variables, so light and dark mode follow automatically.
- CSS applies to the page as you type, after a 400 ms pause. Each typing
  burst is one app undo step (coalesce key `code:css`).
- Undo from the page updates the editor text (the value is synced into CodeMirror).
- CodeMirror is lazy-loaded as its own chunk (181 kB gzipped), only when
  the Code tab opens. Nothing else downloads it.
- The left column widens (`min(520px, 40vw)`) while the Code tab is open.
- The paste box on the front page stays a plain text box: it's for
  non-coders pasting large replies.
- e2e: `sidebar.mjs` types into CodeMirror and checks live CSS and undo sync.

## fix/my-pages-no-index — 2026-09-29
- "My pages" failed with `failed-precondition` on a fresh Firebase project,
  because the `ownerId + updatedAt` composite index was missing.
- `listMyProjects` now filters on `ownerId` only and sorts newest-first in
  the app. One person has at most a plan's worth of pages, so this is cheap,
  and a single-field filter needs no custom index.
- That index is removed from `firestore.indexes.json`. The only custom index
  left is the public gallery's (`isPublic + updatedAt`).
- There's an emulator test for the query (13 of 13 pass).

## feature/namespaced-collections — 2026-09-29
- Collections were renamed so the app can't collide with another app in the
  same Firebase project:
  - `users` → `tweak_users`
  - `projects` → `tweaks_projects`
  - `projectContent` → `tweaks_project_content`
- The names live in `src/lib/collections.ts`. `firestore.rules` and
  `firestore.indexes.json` repeat them because they can't import code.
- There was no data to migrate: every earlier save had been refused.
- Needs a redeploy of the rules and indexes.
- Checks: 12 of 12 rules tests pass on the emulator, along with tsc, lint,
  unit tests and the build.

## fix/shared-project-profile — 2026-09-29
- The real cause of "New page" `permission-denied`: the Firebase project
  (`look-vince`) already had `users/{uid}` from another app, without
  `projectCount` / `plan`. The app saw "profile exists" and skipped it, and
  the counter update in the create batch then failed the rules.
- `ensureUserProfile` now runs in a transaction. It creates a profile when
  one is missing, or adds only `projectCount: 0` (plus `plan: 'free'` when
  absent) to someone else's document. A new narrow `repairProfile()` rule
  allows exactly that.
- The rules tests finally ran, on the emulator with a portable JRE.
  `tests/rules/appFlow.test.ts` runs the app's real Firestore Lite code and
  covers a fresh profile, a missing profile, a foreign profile, and
  concurrent checks. 12 of 12 pass. It also found a race (two profile
  checks at once) and a bug in my own test.
- **Needs a redeploy of the rules.** In a shared project, deploying the rules
  replaces the other app's rules too.

## fix/missing-profile — 2026-09-29
- "New page" failed with `Commit … permission-denied` after the rules were
  deployed. The first sign-in had happened under the default deny-all rules,
  so `users/{uid}` was never created. A restored session never retried it,
  and the batch that bumps the page counter had nothing to update.
- `ensureUserProfile` now also runs when a session is restored and right
  before `createProject`.
- There is a rules test for the missing-profile case.

## fix/firestore-lite — 2026-09-29
- The console showed "Error processing response text: AbortError: signal is
  aborted without reason". It comes from the full Firestore SDK's WebChannel
  stream being cut on navigation or StrictMode remounts.
- The app now uses `firebase/firestore/lite`, which sends plain HTTPS
  requests with no stream. The Firebase chunk went from 552 kB to 199 kB
  (162 → 59 kB gzipped).
- Found while checking a real project: it still had Firebase's default
  deny-all rules, so gallery, saving and My pages were refused. The fix is
  `firebase deploy --only firestore`, as in the README.
- Opt-in live smoke test: `e2e/live/firestore.mjs`.

## feature/future-features — 2026-09-29
- Billing (flag `enable_billing`, off): a `/plans` page (Free / Pro) and a
  pluggable `PaymentProvider` in `billing/payments.ts` with a `crypto` stub.
  Upgrades must be applied by a trusted server (payment webhook → Firebase
  Admin SDK). The rules already refuse plan changes from the browser.
- Marketplace (flag `enable_marketplace`, off): the `Listing` / `Order` model
  and the planned Firestore shape in `marketplace/types.ts`, plus a
  "coming soon" `/market` page.
- `flagged(flag, element)` in the router makes these routes 404 while their flag is off.
- e2e: `flags.mjs`.

## feature/gallery — 2026-09-29
- `/gallery` (Explore) shows public pages with thumbnail, name, author and
  date, 24 at a time ("Show more"). It has friendly empty states, including
  when accounts are off.
- `/p/:id` shows a shared page in `SafePageFrame` (never `allow-same-origin`),
  with Computer/Tablet/Phone views and Download.
  - Visitors get "Make my own copy". It asks them to sign in if needed, then
    creates a private copy with `remixOf` that counts toward their limit.
  - Owners get Edit. Private or missing pages show a notice.
- Refactor: Preview and public pages share one `features/export/SafePageFrame`.
- e2e: `gallery.mjs`. The live Firestore paths still need a real project to test.

## feature/assets — 2026-09-29
- `workers/assets` is a Cloudflare Worker backed by R2:
  - It checks Firebase ID tokens with jose and Google's JWKS.
  - It accepts PNG, JPG, WebP, GIF and AVIF up to 5 MB, and refuses SVG.
  - Keys are per user; CORS is limited to the app's origins; files are
    served with `nosniff` and a locked CSP.
  - `npm run check` runs tsc plus `wrangler deploy --dry-run`.
- "Use a picture from my computer" in Change picture uploads to R2 when
  signed in with `VITE_ASSETS_URL` set. Otherwise pictures under 400 KB are
  embedded in the page and bigger ones get a friendly message.
- Project thumbnails: a small top-of-page PNG is uploaded after saves (at
  most every 2 minutes, always on Ctrl+S) and shown on the dashboard cards.
  Failures are silent.
- `capturePng` gains `pixelRatio` / `topOnly` options.
- Tests: `uploadImage.test.ts` and e2e `assets.mjs`.
- Not tested live: the deployed Worker and R2, which need a Cloudflare account.

## feature/workspace — 2026-09-29
- Firestore data: `users/{uid}` holds the plan and `projectCount`,
  `projects/{id}` the metadata, and `projectContent/{id}` the page as a JSON
  string (`features/workspace/api`).
- The 10-page limit: clicking "New page" creates the project and adds 1 to
  the count in one batch, and deleting gives the slot back. `firestore.rules`
  only let the counter move by one together with the project it belongs to
  (`lastProjectOp`), so it can't be tampered with or bypassed. Plans (free
  10 / pro 100) are in `billing/plans.ts` and mirrored in the rules.
- Public or private per page. Public pages can be read by anyone, and the
  flag is mirrored on the content doc for cheap rules.
- Pages:
  - `/projects` shows cards, the usage meter and a limit notice, with
    rename, make public/private, and delete (with a warning).
  - `/projects/new` is the paste screen, plus "Save the page from Try it".
  - `/edit/:id` is owner-only, autosaves to the account, and has Ctrl+S and
    a Share dialog with the public link.
- Try-it's "Save to an account" goes to signup and then back to `/projects/new`.
  The home page shows "My pages" to returning users through a storage hint.
- Perf fix: Firebase was being preloaded on every page through `RequireAuth`.
  The config is now split into `lib/firebaseConfig.ts`.
- `firebase.json`, `firestore.rules`, `firestore.indexes.json`. The rules test
  suite (`npm run test:rules`) is written but **not run yet**: this machine
  has no Java for the emulator.
- New skill: `.claude/skills/firebase-data`.

## feature/auth — 2026-09-29
- Firebase Auth (`features/auth`): email and password, Google and GitHub
  popups (flag `enable_oauth`), password reset, sign out.
- `authService.ts` is the only file that imports `firebase/auth`, and it
  loads lazily through `startAuth()` / `authService()`. The home page and
  Try-it never download Firebase.
- `ensureUserProfile` creates `users/{uid}` on first sign-in (`plan: 'free'`,
  `projectCount: 0`). The workspace limit lives there.
- Pages: `/login`, `/signup`, `/reset`, with plain-words errors
  (`authErrors.ts`). `?next=` return paths accept same-site paths only, so
  there are no open redirects. Signed-in visitors skip these pages.
- `RequireAuth` guards pages that need an account.
- Without Firebase keys the pages say "Accounts aren't switched on yet" and point to Try it.
- e2e: `auth.mjs`.

## feature/editor-sidebar — 2026-09-29
- The left column has three tabs (`features/editor/sidebar`):
  - **Layers:** a tree with friendly names, hover synced with the canvas,
    and an eye to hide. It opens itself to the selection and scrolls it into
    view. Rows subscribe to primitive selectors, so only the changed row re-renders.
  - **Add:** 10 basic pieces (`blocks.ts`, data only) plus "Paste more code",
    which takes a whole AI reply and inserts only its body.
  - **Code:** the page's CSS and inline scripts, saved when you click away.
- Fix: the toolbar used equal-width side columns, so the right side
  overlapped the zoom controls. It is now `auto 1fr auto`.
- e2e: `sidebar.mjs` (7 checks).

## feature/export — 2026-09-29
- Download dialog (`features/export`) in plain words: Web page (.html),
  Picture (.png), Files for a developer (.zip), plus "Copy the code instead".
  It works on the whole page or "Only <selected part>", and closes after a
  successful download.
- `.zip` holds `index.html` + `styles.css` + `script.js` / `module.js`
  (fflate). External and data scripts stay in the HTML.
- `.png` is captured from the live iframe with a lazily loaded
  html-to-image: 2x, solid backdrop, faded hidden parts left out, and fonts
  from the page itself.
- Preview runs the page's JavaScript in a sandbox with `allow-scripts` but
  never `allow-same-origin`, and has its own screen-size switch. Editor
  shortcuts are off while it's open.
- Color helpers moved to `lib/color.ts`. A repeated toast now replaces the old one.
- e2e: `export.mjs`; the whole suite is 34 checks.
- Known limit: Esc can't close Preview while focus is inside the page
  (cross-origin iframe), so "Back to editing" is always visible.

## feature/import — 2026-09-29
- `features/import/PasteScreen`: one big box for the whole AI reply (code
  fences and chatter are fine). There is an optional split HTML / CSS / JS
  mode, and you can drop an `.html` file.
- `analyzePaste` gives plain-words feedback: a problem ("doesn't look like
  web page code…") or a summary ("5 elements · Tailwind · 1 script (they run
  in Preview)"). Parsing is deferred so typing stays smooth.
- `/try` is now paste-first, with "Try an example page" and "Continue my last page".
- Autosave (`editor/persistence`):
  - `useAutosave(save, where)` is debounced, flushes when leaving, and warns
    on `beforeunload`. It doesn't care where the page is saved, so Firestore
    projects will reuse it.
  - `SaveIndicator` shows the status in the toolbar, and `localDraft` keeps
    the Try-it page in this browser.
- `openDocument()` clears selection and undo history when opening a page.
- e2e: `paste.mjs` covers the AI reply, the summary, Tailwind rendering live
  while page scripts stay off, and the draft after a reload.

## feature/editor-inspector — 2026-09-29
- Right-hand settings panel (`features/editor/inspector`) in everyday words:
  - Config sections: Text, Picture, Arrange items, Background, Spacing,
    Size, Corners & border, Shadow. Each shows 2–4 controls with the rest
    under "More options".
  - Custom sections: Link (address, new tab), Picture file (change, description),
    Words (a box per text piece, for text the rich editor can't open), Show or
    hide per screen size, Page title, and Advanced (element type, class, id,
    raw CSS per screen size, undo all changes here).
  - Values show the real computed style, a dot marks a user change, and ↺
    resets it. A banner says which screen sizes an edit affects.
- Companion styles (`companionStyles.ts`) keep a change visible: a border
  needs a style; gap, alignment and direction need flex; a manual width
  lifts `max-width`.
- Show on a screen size uses `display: revert` when a bigger size or the page's CSS hid it.
- Fixes found in the browser: Esc in a settings box now leaves the box; a
  multi-column grid reads as "Side by side"; controls no longer overflow the
  panel; colors are shown as #hex.
- e2e: `e2e/inspector.mjs` (10 checks).
- Process: from this branch on, commits are small, one per logical change.

## feature/editor-text — 2026-09-29
- Inline text editing with Quill (bubble theme, lazy-loaded chunk):
  - Opens on double-click or Enter, right on top of the element, copying its
    font, size, color and alignment scaled to the zoom. The real element is
    hidden meanwhile (`data-fe-editing`).
  - Enter finishes on one-line elements (headings, buttons, links);
    Shift+Enter adds a line break; Esc cancels; clicking outside saves.
  - A custom `classSpan` blot keeps `<span class>` (for example Tailwind
    colored words), and elements containing icon fonts are not opened in Quill.
  - It only saves when the text really changed (compared with Quill's first
    output), so untouched text is never rewritten.
- Quick-actions bar above the selection: Edit text / Change picture, move
  up/down, select the box around it, duplicate, delete.
- Change picture dialog (paste an image address, description for screen
  readers); `srcset` is removed so the new picture shows. It is one undo step
  (`setAttributes`).
- `e2e/`: browser checks on the local Chrome (`npm run e2e`, dev server on port 5317).
- Fixes: double-click now uses the native click count (Konva's dblclick needs
  the same shape twice). Dev dependencies realigned to eslint 9 +
  @eslint/js 9; `parchment` added explicitly.

## feature/editor-canvas — 2026-09-29
- Konva overlay on top of the iframe (`features/editor/canvas`):
  - Hover outline and click to select, each with a friendly name tag such as
    'Button “See today's menu”'.
  - Drag to move. Flow elements are reordered with a blue drop line;
    absolutely positioned elements move freely.
  - Resize handles set width and height on the current screen size.
  - Wheel scrolls the page, Ctrl/⌘ + wheel zooms, and Shift + wheel pans.
- Drop rule: dropping on a sibling (e.g. a card onto a card) reorders and
  never nests. Dropping on another container nests between its children.
- Toolbar: undo/redo, Computer/Tablet/Phone switch, zoom (Fit, −, +).
- Keyboard: Ctrl/⌘+Z/Y, Delete, Ctrl/⌘+D duplicate, Esc selects the parent,
  Alt+↑/↓ moves, Enter edits text.
- `/try` playground with a sample "Sunny Bakery" page (no account needed).
- Verified in real Chrome (playwright-core): select, card reorder, undo, resize and phone view.
- Fixes found in the browser: the editor body used an `auto` grid column that
  collapsed to 0 width, so it is now flex. Layer text now puts spaces between
  blocks, and a press-and-drag grabs the element under the mouse straight away.

## feature/editor-core — 2026-09-28
- Page model (`features/editor/model`): flat immutable node map; parser for
  pasted code (AI code fences, fragments, full documents, Tailwind CDN, fonts);
  tree operations (move, remove, clone, replace children); serializers (HTML,
  layered CSS plus `.fe-<id>` edit rules, single-file page).
- Stores: doc (undo/redo, coalesced edits), selection, view.
- Actions: styles, node operations (delete, duplicate, nudge, attributes, tag), insert HTML.
- Frame renderer: a sandboxed iframe patched per changed node; page JS off while editing.
- Tests: model plus renderer (vitest + jsdom).
- Decision: Konva can't render HTML, so the page renders in an iframe and
  Konva becomes the interaction overlay (next branch).

## feature/foundation — 2026-09-28
- Vite 8 + React 19 + strict TS, `@/` alias, ESLint with max-lines 150 per
  file / 100 per function.
- Design tokens (warm paper background, coral accent, light and dark), base
  styles, UI kit, lazy router, error and 404 pages, home page.
- Feature flags (`config/features.config.ts`) and lazy Firebase init with a
  "not configured" guard.
