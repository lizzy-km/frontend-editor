# History

One entry per feature branch, newest first. Each branch is merged into `main`
with `--no-ff`, so `git log --first-parent main` shows one merge per feature.

## feature/layouts — 2026-10-14
- **Layouts** (Pages tab → Layout): **Top bar**, **Side menu** or **Both**
  (`model/layouts.ts`, `layoutCss.ts`). They are ordinary boxes (`data-fe-layout`)
  with a menu made from the site's pages; each item keeps the page's "who can
  see this", so menus follow signed-in / roles / flags. Log in, Sign up and Log
  out are added when the site has a Log in page. "Replace my current header"
  swaps the page's own header; "Update layout and menu" rebuilds after adding
  pages; Remove takes boxes and CSS away (one undo step each).
- Responsive: under 860px the top menu collapses behind a ☰ button and the side
  menu slides in; a menu link closes it. The open page's link is highlighted.
- Visitors: `serialize/layoutPlayer.ts` (☰, close on click, highlight in downloads).
- React: menu links become `NavLink` (React Router) or `Link` with `activeProps`
  (TanStack), ☰ and link clicks toggle `body.menu-open`, "Log out" calls the new
  `src/auth/signOut.ts` (reloads so every guard re-checks).
- Verified by building top bar / side menu / both with both routers and driving
  them in Chrome at desktop and phone width (menu, active link, account links
  by sign-in, ☰, Log out).

## feature/popups — 2026-10-14
- **Pop-ups** (`model/popups.ts`): a ready-made **Pop-up** block (a button plus
  the box). The box is an ordinary box while editing (`data-fe-modal="name"`);
  "When clicked" lets any element **open** a pop-up (`data-fe-open`) or **close**
  the one it is in (`data-fe-close`). Renaming a pop-up updates its openers
  (one undo step).
- **Ask first** (`data-fe-ask`): any button or link can ask "Are you sure?"
  before it does anything; ready-made **Ask-first**.
- Preview and downloads: `serialize/popupPlayer.ts` hides pop-ups, centres
  them over the page, closes with a button, Esc or a click outside, and shows
  the question box.
- React: `<Modal name>` (portal, Esc, click outside, focus), `openModal` /
  `closeModal` (`ui/popup.ts`), `askFirst` / `useConfirm` / `<ConfirmHost />`
  (`ui/confirm.tsx`, mounted in main.tsx); onClick handlers combine "click goes
  to", open, close and ask (`export/react/popups/`). Ask-first on a link follows
  it after Yes, on a form button submits the (Zod-checked) form.
- **Page guard outside React** (`model/pageGuard.ts`): Preview and the public
  view now do what the React guards do. A signed-out visitor who opens a
  signed-in page lands on the site's Log in page (a notice when there is none),
  someone without the role sees "No access", and signed-in people are sent away
  from Log in. The downloaded site's private pages redirect to `login.html`
  (a static file can't keep secrets; real protection needs the React download).
- Verified by building the single page, React Router and TanStack output and
  running pop-ups, questions, links and forms in Chrome.

## feature/auth-pages — 2026-10-14
- **Add sign-in pages** (Pages tab): Log in, Create account, Forgot password,
  Set a new password and Confirm email as ordinary editable pages
  (`model/authPages.ts`), each a form with its own look and rules. The first
  three are for signed-out visitors only (a signed-in person is sent home).
  Existing pages with the same address are kept.
- Form section: **It will** (send the answers / log people in / create an
  account / email a reset link / set a new password / confirm email).
- React: sign-in forms call `useAuth()` (`export/react/forms/authForm.ts`):
  after logging in people go to the page they wanted; register asks to confirm
  the email when the API says so; reset reads `?token=`; the confirm page
  confirms the emailed link. The standard fallback login is skipped when the
  site has its own `/login`.
- Redirect fix: the guard no longer consumes the saved destination (the login
  form and the guard raced); it is cleared once the page is reached.
- Verified by building both routers and running register + confirm link,
  protected page → login → back, forgot → reset → new password in Chrome.

## feature/forms — 2026-10-14
- **Forms** are plain HTML (`model/forms.ts`): fields, labels and the browser's
  own rules (required, min/max length, number range, pattern) are read from the
  page, so pasted forms work as they are. Editor extras: `data-fe-match`
  ("Same as", e.g. repeat password), `data-fe-message` (own error text),
  `data-fe-submit` / `action` / `data-fe-success` (send address, thank-you).
- Settings: **Form** section ("Check the answers and send them", send-to
  address, thank-you text) and **Input box** (hint, kind, name, must be
  filled in, letters / number limits, same as, error message).
- Ready-made **Contact form** and **Sign-up form** in Add.
- Preview and downloads: `serialize/formPlayer.ts` checks rules and "same as",
  posts JSON to the address (or thanks the visitor).
- React: every set-up form is its own component with React Hook Form + a Zod
  schema (`export/react/forms/`: `zodSchema`, `formTemplates`, `formJsx`) and a
  small kit (`src/components/form/`: Form, TextField, PasswordField, Select,
  Textarea, Checkbox, SubmitButton, FieldError). Verified by building both
  project types and submitting the forms in Chrome.
- New data preset **Store products (Fake Store API)** with the same shape as
  fakestoreapi.com/products (API address pre-filled).

## feature/auth-backend — 2026-10-14
- **Sign-in in the React download** (`export/react/auth/`), added whenever
  something is shown to only some visitors: `AuthProvider` + `useAuth`
  (sign in, create account, forgot / reset password, confirm email, resend,
  sign out, `hasRole`), `session.ts` (tokens in localStorage, bearer header,
  one refresh on 401), `authApi.ts` (axios, the site's paths) and
  `authMock.ts` (a pretend server with demo accounts; confirm and reset links
  go to the console) used until `VITE_USE_MOCK=false`.
- `<Show when={{ signedIn, roles, flags }}>` wraps every element with a
  condition; `src/config/flags.ts` lists the site's flags (on via `VITE_FLAGS`).
- Route guards per page access: React Router `<RequireAuth roles flags signedOut>`,
  TanStack `beforeLoad: requireAccess({...})`; "No access" page, and a
  standard `/login` unless the site has its own. After signing in people go
  back to the page they wanted.
- Editor: **Sign-in API** in the Data tab (`model/authApi.ts`, `doc.authApi`).
- Verified by building both routers' output and running them in Chrome
  (visitor/member/admin menus, redirects, No access).

## feature/conditions — 2026-10-15
- **Who can see this** (`model/conditions.ts`) on any element and on pages:
  everyone / signed in (optionally some roles) / signed out, plus flags that
  must be on (`data-fe-show`, `data-fe-roles`, `data-fe-flags`; old
  `data-fe-private` pages still read as "signed in"). The site's roles and
  flags (`PageDoc.access`, default roles member and admin) are added from the
  same control.
- **Viewing as** (toolbar, appears once something uses a condition): visitor,
  signed in, each role, and flags. The editor hides what that viewer can't
  see (editor-only view CSS; the page being edited always shows), and
  Preview follows it. Downloads show what a signed-out visitor sees.

## feature/animation-box — 2026-10-14
- **Animations on any element** (`model/animations.ts`, `data-fe-animate`,
  `-trigger`, `-duration`, `-delay`, `-ease`, `-stagger`, `-repeat`): fade, fade
  up/down, slide in, zoom in/out, flip, unblur; when it scrolls into view, on
  load, on hover or looping; smooth / bouncy / steady; "one by one" for the
  children. Settings section "Animation" (with **Play**), and a ready-made
  **Animation box** in Add.
- While editing nothing hides: animations only play on Play (`runtime/animate.js`).
- Preview, public view and downloads: a Web Animations player
  (`serialize/forVisitors.ts`, IntersectionObserver, respects reduced motion).
- React: `motion.<tag> {...animation({ … })}` with `animationItem` children
  for "one by one" (also list cards), plus ready-made
  `src/components/ui/animation.ts` and `AnimateBox.tsx`; `motion` added only when used.
- Checked: animated exports pass strict `tsc` and `vite build`; in Chrome the
  box is hidden until scrolled into view, load animations finish, list cards appear.
- Fixes: settings sections are keyed per element (no open/closed state left
  over from the previous selection); e2e pastes only once CodeMirror has loaded.

## feature/data-list — 2026-10-14
- **"List from data"** (Add → Ready-made): a box holding ONE card design whose
  parts show fields of a data source (`data-fe-list`, `data-fe-page-size`,
  `data-fe-load`, `data-fe-bind`, `data-fe-bind-<attr>`; `model/dataLists.ts`).
  - Editor: the frame runtime (`runtime/lists.js`) shows copies filled with the
    sample rows after the design; copies keep the design's id, so they share its
    styles and clicking one selects the design. Settings: data, cards per page,
    "On scroll" / "Show all"; inside the card, "Show data" picks the field for
    text, pictures (src/alt) and links.
  - Preview, public view, .html/.zip: `serialize/expandLists.ts` repeats the
    card per row (static).
  - React: `XList.tsx` (the box, `useXInfinite(pageSize)` + the ready-made
    `src/components/ui/InfiniteScroll.tsx`, or `useX()` for "show all") and
    `XCard.tsx` typed by the row (`({ name, image }: Product)`). The editor's
    `data-fe-*` markers never reach the React code.
- Checked: exports with both kinds of list pass strict `tsc` and `vite build`; in
  Chrome the scrolling list shows 3 cards, then 6 after scrolling.

## feature/data-panel — 2026-10-14
- **Data tab**: data sources (`PageDoc.data`) with typed fields (text, long
  text, number, yes/no, picture link, date, link), sample rows and an optional
  API (address, where the list is, page and page-size parameters). Start from
  Products, Blog posts, Team members, Reviews, Events or empty. Fields and rows
  are edited in a table dialog; every change is one undo step.
- **React export** (one page and sites): `src/data/types.ts` (one type per
  source, an `id` added for React keys), `src/data/mockData.ts` (global mock
  data), `src/api/client.ts` (axios + `pickList`), `src/api/<name>.ts` with
  `fetchX`, `useX()` and `useXInfinite()` (React Query), `.env.example`
  (`VITE_USE_MOCK`, `VITE_API_URL`) and a `QueryClientProvider` in `main.tsx`.
- Checked: projects with paged and unpaged APIs pass strict `tsc` and `vite build`.

## feature/multi-page — 2026-10-14
- **One page or a website**: Try-it and New page ask "What are you making?"
  and can **start with a blank page** (a site's blank start has a shared
  header and footer). One-page projects can become a website later
  (page settings → "Make this a website with several pages").
- **Sites live in one document** (`model/pages.ts`, `model/pageOps.ts`): what
  is in <body> outside page containers is the shared layout; each page is
  `<div data-fe-page data-fe-path data-fe-title [data-fe-private]>` with
  `display: contents`. One stylesheet, one undo history, header/footer edited once.
  - Editor: a **Pages** tab (add empty / pasted code / copy, rename, address,
    reorder, delete, "only for signed-in visitors"); the frame shows the current
    page through editor-only view CSS; Layers and Add follow the current page.
  - Links: "Go to a page" picker on links; **"Click goes to"** on any box (`data-fe-go`).
  - Preview and the public view move between pages; .html / copy download the
    current page; the developer .zip holds the whole site (one .html per page,
    shared styles.css/script.js, links and click boxes pointing at the files).
  - Clicking empty space below a short page selects the page itself.
- **React project for sites**: `src/layout/Layout.tsx` (shared parts +
  `<Outlet />`), `src/pages/*Page.tsx`, components per page, `src/router.tsx` with
  **React Router or TanStack Router** (picked in the Download dialog), a
  NotFound route, router `<Link>`s, `useNavigate` for click boxes, and for
  signed-in-only pages a **mock AuthProvider + route guard** (RequireAuth for
  React Router, `beforeLoad` + `redirect` for TanStack) and a login page.
- Checked: both routers' exports pass their own strict `tsc` and `vite build`
  and work in Chrome (pages, links, guard → login → back, 404).

## fix/wider-paste-box — 2026-10-09
- The paste card is up to 1120px wide and the code box starts at 360px tall.

## feature/codemirror-everywhere — 2026-10-08
- Every code box uses CodeMirror (colours, line numbers, search, brackets):
  the paste screen (one piece, or HTML / CSS / JavaScript) and "Paste more
  code" in Add, as well as Page code, Styles, Scripts and Edit code.
- The editor moved to `src/shared/code/` (shared by import and editor):
  `CodeEditor` (placeholder, autofocus, min/max height, optional Fold all
  toolbar, `onDropFile` for dropped .html files) and `LazyCodeEditor`, which
  shows a plain box with the same value until CodeMirror has downloaded.
  The paste screen preloads it. Text boxes for words (Words list, AI brief)
  stay plain on purpose.
- e2e `pasteCode()` sends a real paste event; `code-editors.mjs` checks each box.

## feature/prompt-groups — 2026-10-08
- AI prompts are grouped like the Landing Page builder's, each group with its
  own intro and blank brief (`prompts/promptGroups.ts`), 35 ideas in all:
  - **Business & services**: café, salon, home for sale, online course, charity.
  - **Brands & launches**: brand homepage, new product release, app launch,
    fashion collection drop, drinks brand, skincare launch.
  - **Events & celebrations**: wedding, birthday party, company dinner party,
    graduation party, festival, workshop, conference, concert.
  - **Portfolios**: the builder's 11 professions (designer, developer,
    photographer, architect, filmmaker, illustrator, writer, marketer,
    musician, fashion, 3D) plus an online CV.
- Eye-catching results: every intro asks for a premium, studio-quality
  design, and the rules gained "8. DESIGN — MAKE IT EYE-CATCHING" (one visual
  idea, a striking hero, confident color, characterful type, depth, layout
  variety, tasteful motion, framed photos). Briefs got richer art direction.

## feature/background-panel — 2026-10-05
- **Background section** (`inspector/background/`): Color, then **Picture**
  and **Gradient** tabs (a dot shows which is in use). Both can be used at
  once: the gradient is drawn over the picture (e.g. "Darken photo").
  - Picture: choose from the computer or paste a link (shared
    `quick/PicturePickerDialog`, also used by Change picture), preview,
    remove, fit (fill / show all / original / stretch), a 3×3 "keep in view"
    grid, repeat, "stays still when the page scrolls". A first picture
    fills the box, centred, shown once.
  - Gradient: 10 ready-made ones, Straight / Round / Sweep, 8 direction
    arrows + exact angle, middle point and circle/oval for round ones,
    2–5 colors each with position and solidness, add (blended), remove,
    flip, "use on the text instead" (gradient text), remove.
  - `background-image` is parsed exactly (`gradient.ts`,
    `backgroundLayers.ts`); anything the controls can't represent (px stops,
    several pictures) is shown as is with "Start over", never rewritten.
- See-through (opacity) moved to "Shadow & see-through": it fades the whole
  element, not the background.

## fix/local-files-and-uploads — 2026-10-05
- A page copied from a dev server links files that weren't pasted
  (`/@vite/client`, `/src/main.tsx`, `css/site.css`). In the editor frame and
  Preview those resolved to Tweak's own server. Now they're left out there
  (`serialize/localFiles.ts`); downloads keep the links. The paste screen
  names them and explains how to copy the finished page instead.
- Uploads: an `r2.dev` bucket address in `VITE_ASSETS_URL` (read-only)
  switches uploads off with a dev hint; uploads need the deployed Worker.
  If the service can't be reached, small pictures are embedded instead.

## feature/react-export — 2026-10-05
- **Download → React project (.zip)**: the page (or the selected part) as a
  Vite + React + TypeScript project, counted like any other download.
  - One component per part (header, each section, footer); `<main>` stays
    in `App.tsx` with its sections inside.
  - Repeated items with the same structure (cards, menu items, reviews,
    FAQ entries) become one typed component plus a data list in the part
    that uses them (`cardItems.map(...)`). Only real items with structure
    inside; never inside SVG, never plain text lists.
  - Correct JSX: React attribute names, numbers and booleans, form defaults
    (`defaultValue`), SVG attributes, spaces kept like the browser shows them,
    `{}` escaped, `<pre>` exact. Inline `onclick=` handlers ride along as
    `data-on*` and are restored after mount.
  - CSS unchanged (incl. tablet/phone edits); `body >` rules are pointed
    through `#root`, which takes no space (`display: contents`).
  - The page's own inline JavaScript goes to `public/scripts/` and runs once
    after mount (`src/runPageScripts.ts`), with "page loaded" listeners run
    right away. Libraries and head settings stay in `index.html`.
- Checked: test1–3 exports pass the project's own strict `tsc` and `vite
  build`, and the built apps match the original pages (same elements, text,
  hidden text and height; script-drawn parts present).

## feature/ai-prompts — 2026-10-05
- **"No code yet?" helper** on the paste screen (Try-it and New page), like
  the Landing Page builder's AI prompt: pick one of 10 ready-made page ideas
  (café, product launch, salon, home for sale, portfolio, online CV, wedding,
  event, online course, charity) or start blank, change the description in
  your own words, copy, and open ChatGPT / Claude / Gemini.
- Each prompt = intro + Part 1 (the brief, editable) + Part 2
  (`prompts/promptRules.ts`): one self-contained file, real text in real
  elements, every section with an id and class, CSS tokens on `:root`, the
  editor's two breakpoints (1024px / 640px), Unsplash `<img>` pictures, and
  JavaScript that only enhances content already in the HTML.
- Usage stats: `prompt_copy` (which idea, whether it was edited).

## feature/vercel-analytics — 2026-10-01
- Vercel Web Analytics for the Vercel deployment (`vercel.json`: SPA
  rewrites, long cache for `/assets`). Same opt-out/DNT rules as Firebase;
  page ids are removed from reported addresses.

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
