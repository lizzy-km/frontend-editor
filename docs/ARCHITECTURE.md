# Architecture

> Who this app is for: everyday people (not coders, not designers) who got a
> web page from an AI chat and want to change it by clicking, then download it.
> It is an **editor**, not a page builder: pasting is the main way in.

## Stack

| Concern | Choice |
| --- | --- |
| App | Vite + React 19 + TypeScript (strict) |
| State | Zustand (small stores, one job each) |
| Canvas interaction | Konva overlay on top of an iframe |
| Rich text | Quill |
| Auth + data | Firebase Auth + Firestore |
| Files (images, thumbnails) | Cloudflare R2 through a Worker (`workers/assets`) |

## Folder layout (feature based)

```
src/
  app/            router, error pages, App shell
  config/         app constants + feature flags
  lib/            tiny framework-free helpers (ids, debounce, download, firebase)
  shared/ui/      design-system primitives (Button, Modal, Icon, TopBar...)
  shared/hooks/   cross-feature hooks (theme)
  styles/         tokens.css (light/dark) + base.css
  features/
    home/         public landing page
    import/       paste screen (the front door)
    export/       download html / zip / png, preview, SafePageFrame
    auth/         sign in / up, account menu, RequireAuth
    workspace/    my pages (Firestore), new page, project editor, share
    gallery/      Explore + public page view + make a copy
    assets/       picture uploads (R2 worker client), thumbnails
    billing/      plans (limits), future crypto checkout
    editor/
      model/      page model: types, parse (paste -> nodes), tree ops, serialize (nodes -> html/css)
      store/      doc (with undo), selection, view
      actions/    user-level edits (setStyle, deleteNode, insertHtml...) — UI calls these
      canvas/     Konva overlay (select, drag, resize)   text/  Quill   quick/  floating actions
      inspector/  right settings panel                  sidebar/  Layers / Add / Code
      persistence/ autosave + local draft               toolbar/  top bar pieces
      frame/      sandboxed editor frame: page source, bridge, in-frame runtime
```

Rules: files ≤ 150 lines, functions ≤ 100 lines (ESLint enforces both), one
responsibility per function. Features import from `shared/` and `lib/`, never
from another feature's internals (use that feature's exported functions).

## The page model (`features/editor/model`)

A pasted page becomes a **flat, immutable map** `id -> node`:

- `ElementNode { tag, attrs, styles: { desktop?, tablet?, mobile? }, children: id[], parentId }`
- `TextNode { text, parentId }`
- `PageDoc { rootId (the <body>), nodes, css, links, scripts, htmlAttrs, title }`

Why flat and immutable: ids stay the same when things move, undo snapshots are
cheap (unchanged nodes are shared), and the renderer can compare node objects
by reference to find exactly what changed.

**Nested content always lives in `children`.** Never add a second array of
child nodes; every tree helper only walks `children`.

### Import (`parse/`)
1. `stripCodeFences` removes the ```` ```html ```` fences and chat text around them.
2. `combinePastedCode` merges optional CSS/JS boxes into one document.
3. The browser's `DOMParser` repairs broken HTML exactly like a browser would.
4. `extractPageExtras` pulls out `<style>`, stylesheet links and `<script>`s.
5. `elementToNodes` walks the body. Inline `style=""` becomes `styles.desktop`.

The original CSS is **kept as text, untouched**. We never try to parse it
into nodes, so nothing the AI wrote gets lost.

### How edits win over the original CSS
- Pasted CSS is wrapped in `@layer page { … }`. Rules outside a layer always
  beat rules inside one, whatever their specificity.
- Edits are emitted as `.fe-<id>.fe-<id>` rules (`[data-fe-id]` doubled in the
  editor). The doubled class also beats Tailwind utilities, which the Tailwind
  CDN injects later at runtime.
- Breakpoints are desktop-first: tablet `max-width: 1024px`, phone `max-width: 640px`.

## Rendering (`features/editor/frame`)

The editor shows the page the way Preview does: its own CSS **and scripts**
run, inside a locked frame.

- `buildEditorSource(doc)` (`editorSource.ts`) is the Preview page plus:
  `data-fe-id` on every element (hidden ones kept, marked `data-fe-hidden`),
  the model as JSON (`<script type="application/json" id="fe-model">`, `<`
  escaped), and the **frame runtime** (`frame/runtime/*.js`, inlined via
  `?raw`). The runtime runs after the body is parsed and **before** the page's
  own body scripts, so it links model ids to the untouched DOM first.
- `EditorFrame` uses `sandbox="allow-scripts"` only: no `allow-same-origin`
  (the page can't reach the app, its storage or its login), no forms, popups,
  modals or top navigation. The frame is rebuilt only when `sourceKey`
  changes (links, scripts, html attrs, head tags); everything else is patched.
- The editor and the frame talk through `bridge.ts` (postMessage):
  - editor → frame `{ fe: 1, type, payload, rid? }`; the frame answers with
    `reply`. Both sides check the sender window (`event.source`).
  - Messages before the frame's `ready` wait in a queue.
  - Sent: `sync` (changed nodes + removed ids, from `diffNodes`), `css`
    (page / edits), `watch`, `mark`, `scroll`, `loadCapture`.
  - Asked: `hit`, `drop`, `position`, `computed`, `capture`.
  - Streamed: `rects` — boxes of the watched nodes, every animation frame,
    only when they change.
- `frame.store` holds the bridge and the streamed rects; use `askFrame`,
  `tellFrame` and `watchNode` instead of touching the bridge.
- Runtime files: `core` (protocol), `render` (patch only changed nodes, SVG
  aware), `measure` (rects, hit test, computed styles, marks, scroll),
  `drop` (drop slots), `capture` (PNG with html-to-image), `ready`.
- The iframe has `pointer-events: none`; the Konva overlay handles all
  pointer input, so page click handlers never fire while editing.

## Canvas and overlay (`features/editor/canvas`)

```
.canvas (container, measured with ResizeObserver)
 ├─ .page  → EditorFrame (iframe, width = breakpoint width, CSS-scaled)
 └─ Konva Stage (same size as the container, on top, gets all pointer input)
```

- `Canvas` works out `scale` (Fit = the page width fills the area) and the
  frame's `left`/`top`. Together these are a `FramePlacement`, used for every
  coordinate conversion (`geometry.ts`).
- `nodeIdAt(x, y)` maps overlay pixels to frame pixels and asks the frame
  (`hit`: `elementFromPoint`, then the closest `data-fe-id`). It is async;
  hover keeps only the newest answer, clicks are always answered.
- `useTrackedBox(id)` watches a node; the frame streams its box every
  animation frame when it changes, so it follows scrolling, loading images
  and animations without extra wiring.
- `DraggableBox` is a Konva Rect whose position is set **imperatively**, so
  Konva's drag and resize never fight React props; it snaps back to the
  measured box afterwards.
- `useBoxDrag` handles flow elements with `findDropTarget` (blue line) and
  `moveNodeTo`; absolute or fixed elements get `left`/`top` styles instead.
- `SelectionBox` adds a Konva Transformer; `resize.ts` turns the active
  handle into width and/or height styles.
- The editor screen is `layout/EditorLayout`, with slots for the toolbar and
  the left, right and overlay areas, so pages plug in their own panels.

## Text editing (`features/editor/text`) and quick actions (`features/editor/quick`)

- `isTextEditable` (`model/tree/textRules.ts`) is true when an element holds
  only text plus simple formatting. Pictures, boxes and icon fonts mean no.
- `TextEditorLayer` lazy-loads `QuillEditor` when `selection.editingTextId` is set.
- Flow: `childrenToHtml` goes into Quill, then `getSemanticHTML`, then
  `quillToInlineHtml` (paragraphs become `<br>`), then `setInnerHtml`
  (which parses back into nodes).
- `QuickActions` is the floating DOM toolbar for the selection. Buttons are
  chosen by element kind (text, picture or box).

## Settings panel (`features/editor/inspector`)

- `Inspector` shows, for the selected element: header, screen-size notice,
  custom sections (Page, Words, Link, Picture file), the config-driven
  `StyleSections`, Show or hide, and Advanced.
- Style sections are **data** (`fields/*.ts`, `SectionConfig`/`StyleField`):
  `prop`, everyday `label`, `control` (color | slider | select | segmented |
  size | text | sides), an optional `read` for misleading computed values,
  `when(context)` to decide where a section applies, and `more` for the
  "More options" fields.
- `FieldRow` value = the override on this breakpoint, else `read(computed)`,
  else computed. Changes go through `setStyle`/`setStyles`, plus `companionStyles`.
- The Background section is a component, not config
  (`inspector/background/BackgroundSection`, placed after "arrange" via
  `BACKGROUND_AFTER`). It reads `background-image` (edit, else computed) into
  `{ gradient, picture, custom }` and writes the whole value back in one
  `setStyle`, gradient first (on top). Picture options are single values,
  which apply to every layer.
- `useComputedStyle(id)` asks the frame for `getComputedStyle` one frame after
  each edit or screen-size change (edits reach the frame first: messages keep
  their order).
- Text inputs use `useDraft` (prop → local draft; save on Enter or blur).
  This avoids setState-in-effect.

## Developer docs (`src/dev/`, route `/dev`)

- Development only: `router.tsx` adds the route behind `import.meta.env.DEV` (the build drops the branch and the lazy chunk),
  `DevDocsPage` also returns the not-found page when it is not DEV, and `RouteSeo` marks it `noindex`. Nothing links to it.
- `docsFiles.ts` holds the `import.meta.glob` reads of the repo (docs, skills, sources, e2e specs, diagrams). Vite refuses
  to serve `.env*` files, so settings come from the declarations in `src/vite-env.d.ts` (keep a comment above each).
- `markdown.tsx` (reader), `codeIndex.ts` (exports + the comment above each), `overviewData.ts` (routes, flags, settings,
  specs, scripts): pure and tested in `dev.test.ts`. A new diagram needs its entry in `WorkflowView.tsx` `DIAGRAMS`.
- After a production build, search `dist` for "Tweak developer docs": there must be no match.

## SEO (`config/seoRoutes.ts`, `shared/seo/`, `scripts/seo/`)

- `seoRoutes.ts` is the single list of public screens (no imports: the build reads it). A new public screen needs a line
  there (title ≤ 65 characters, description 70–160, a summary for crawlers without scripts); private ones are covered
  by `NOINDEX_PREFIXES`; anything unknown is `noindex` with a "not found" title.
- Runtime: `RouteSeo` -> `Seo` -> `headTags` (pure) -> `applyTags` (finds tags by `data-seo` or adopts hand-written
  ones). A screen with content-dependent words renders its own `<Seo>` (it wins, as it runs later); structured data
  uses `<JsonLd>` (`page-*` keys, removed when the screen leaves).
- Build: `vitePlugin.ts` (closeBundle) uses `staticPages.ts` to write `<route>/index.html`, `robots.txt`, `sitemap.xml`.
  Canonical, `og:url`, the share picture and the sitemap need `VITE_SITE_URL` and are left out without it.
  Hosts serve these files before the SPA rewrite (`vercel.json`), so crawlers get the right head per address.

## Usage stats (`features/analytics`)

- `track(name, params)` is the one way to send an event; `events.ts` lists
  every event with typed params. `track.ts` is tiny and always loaded; the
  SDK (`analyticsClient.ts`, chunk `firebase-analytics`) loads on first use
  after the page is idle. Calls made before that keep their order.
- Sends nothing when not configured, in dev, in tests, under DNT/GPC, or
  after opt-out (`consent.ts`, localStorage `tweak:analytics`).
- `startAutoTracking(router)` (in `App`) sends one `page_view` per screen
  with ids removed (`/edit/:projectId`) and reports uncaught errors as
  `exception` (max 10 per visit). `RouteError` reports crashes as fatal.
- `webVitals.ts` lazy-loads `web-vitals` (only when sending) and reports
  each Core Web Vital once per visit as `web_vital`, tagged with the screen.
- `analyticsClient` sets Consent Mode v2 defaults before starting
  (analytics granted, ad storage / user data / personalization denied).
- `VercelAnalytics` (in `App`, production only) adds Vercel Web Analytics
  page views; its `beforeSend` drops events when stats are off and removes
  page ids from addresses (`withoutIds`).
- `identifyUser(uid, plan)` sets the user id and `plan`/`signed_in`
  properties (from auth and `getUsage`).
- Edits are counted per undo step (`editor/actions/editStats.ts` uses the same
  800 ms coalescing window as the doc store).

## AI prompts (`features/prompts`)

- `promptGroups.ts`: `PROMPT_GROUPS` (business, brands, events, portfolios),
  each with its own intro and blank brief; briefs live in `presets/*`.
- `prompts.ts`: `PROMPT_PRESETS`, `buildPrompt(brief, presetId)` = the
  preset's group intro + brief + `PROMPT_RULES` (plus `SITE_RULES`, the several-pages
  part, when the paste screen's "website" option is chosen).
- `promptRules.ts` must stay in step with the parser and the editor frame:
  if the editor learns or drops something (a breakpoint, a supported
  pattern), update the rules too.
- `AiPromptHelper` sits on `PasteScreen`, folded by default.

## Multi-page sites (`model/pages.ts`, `model/pageOps.ts`)

- A site is ONE `PageDoc`. Body children that are page containers
  (`[data-fe-page]`, `display: contents`) are pages; everything else in <body>
  is the shared layout. Page attrs: `data-fe-path`, `data-fe-title`,
  `data-fe-private`; any element may carry `data-fe-go` ("click goes to").
- `view.store.pageId` is the page being edited (`resolvePage` falls back to
  the first). The editor frame hides other pages with editor-only view CSS
  (`viewCss`, runtime `css.view`); Layers shows layout + current page; Add
  inserts into the current page when nothing is selected.
- `serialize/sitePages.ts`: `pageDoc(doc, pageId, { fileLinks })` unwraps one
  page into a normal document (Preview, .html, copy); `allPagesForFiles` builds
  the shared files of the site .zip. `SafePageFrame` posts page changes to its
  parent (`onOpenPage`).
- React: `export/react/buildSiteProject.ts` (Layout + pages + router),
  `routerTemplates.ts` (React Router / TanStack), `auth/` (sign-in,
  guards, login; see Sign-in below). One-page documents keep `buildReactProject` (App.tsx).
- `import/projectKind.ts`: the paste screen's "one page / website" choice and blank starts.

## Data sources (`model/data.ts`, `sidebar/data/`)

- `PageDoc.data: DataSource[]` (`{ id, name, fields, rows, api? }`), edited by
  pure ops in `model/data.ts` (code-safe names, rows follow field renames and
  type changes) committed through `actions/dataActions.ts`.
- React: `export/react/dataTemplates.ts` writes types, mock data, the axios
  client and per-source React Query hooks; `mainTemplate.ts` composes the
  providers (React Query outside, auth inside).

## "List from data" (`model/dataLists.ts`)

- A list box's first element child is the card design; bindings are
  `data-fe-bind` (text) and `data-fe-bind-<attr>` attributes.
- Editor: live copies by `frame/runtime/lists.js` (data sent with the `data`
  message and inside the frame's model JSON); static copies for Preview and
  downloads by `serialize/expandLists.ts`; React list/card components by
  `export/react/listTemplates.ts` (`JsxContext.lists` / `.row`).

## Animations (`model/animations.ts`)

- One table of effects (`EFFECTS`: from/hover poses) drives the editor's Play
  (`runtime/animate.js` gets keyframes), the visitors' player
  (`serialize/forVisitors.ts`, which also fills data lists) and the React
  helpers (`export/react/animationTemplates.ts`). The JSX writer turns animated
  elements into `motion.*` (`jsxExtras.motionFor`).

## Conditions (`model/conditions.ts`)

- `conditionOf(node)`, `visibleTo(condition, viewer)`, `hiddenFor(nodes, viewer)`.
  `view.store.viewer` is "Viewing as"; `viewCss(doc, pageId, viewer)` hides
  elements in the frame; `forVisitors(doc, viewer)` removes them for Preview
  and downloads.

## Sign-in in the React download (`export/react/auth/`)

- `authFiles(doc, router?)` adds everything when `needsAuth(doc)` (an element
  or page has a condition): types, session (tokens, refresh interceptor on
  the shared axios `api`), `authApi` (paths from `model/authApi.ts`
  `endpointsOf(doc)`), the mock server, `AuthProvider`/`useAuth`, `Show`,
  `config/flags.ts`, and with a router the guard, NoAccessPage and a
  fallback LoginPage.
- The JSX writer wraps conditional elements in `<Show when>` (`jsxExtras.showWhen`).
- Guards come from `routeGuard(kind, access, element)`. React Router's
  signed-out guard does the redirect after sign-in (the login page doesn't
  navigate itself, or the two race); TanStack uses `beforeLoad` + `redirect`
  (a `<Navigate>` in a TanStack route component loops).

## Saving to the account (`workspace/api/`)

- `serializeDoc` (async) = `packDoc` (JSON, gzip + base64 above ~20 KB when the
  browser can) and a size check; `loadProjectContent` = `unpackDoc` (reads both
  formats). Errors that carry words for the person set `friendly = true`;
  `useAutosave` puts them in `useSaveStore.problem` and the toolbar shows them.
  Never show "check your connection" for an error you can explain.

## Real APIs (`model/apiTest.ts`, `sidebar/data/ApiConnectDialog.tsx`)

- The test runs in the editor with `fetch` (so CORS applies there); its result
  goes through `parseJsonValue`, the same path as pasted JSON, so a connected
  source and an imported one have the same fields (`from` = place in the answer).
  The exported hook (`dataTemplates.sourceFile`) maps with `toRow`/`FIELDS` and
  sends `HEADERS` from `import.meta.env.<envVar>`; keep the editor test and the
  export in step when the request shape changes (paging, headers).

## Data on boxes (`model/dataRecords.ts`, `inspector/sections/DataSection.tsx`)

- `dataBoxOf(nodes, id)` = list (`data-fe-list`) or record (`data-fe-record` +
  `data-fe-row`). Bindings are the same for both (`data-fe-bind[-attr]`); a
  binding that starts with "/" is an address template (`/user/:id`) filled from
  the row (`resolveBinding`, mirrored in `frame/runtime/lists.js` and
  `serialize/recordPlayer.ts`). `expandRecords` / `expandDataLists` fill
  Preview and downloads; `?id` boxes also get `recordPlayer`.
- React: `records/recordTemplates.ts` (component + hook call), the hook is in
  `dataTemplates.ts`; list cards can navigate or call a handler
  (`CALL_ATTR`, `handlers.ts`). `routerLinks.ts` holds the router import/hook helpers.

## Cards that open a pop-up (`serialize/clickedPlayer.ts`, `fillRow.ts`)

- A list's card design with `data-fe-open="name"` opens that pop-up; the pop-up is a record box with
  `data-fe-row="clicked"`. Static expansion (`expandDataLists`) marks each card `data-fe-item` (index) and `data-fe-from`
  (source); `fillCard(..., keepTemplates)` keeps address templates next to their values for these pop-ups.
- Visitors: a capture-phase click listener fills the pop-up from the clicked card's row, then the normal pop-up
  player opens it. `fillRow.ts` holds the one browser-side fill script (`value`/`fill`); keep it in step with
  `resolveBinding` and `frame/runtime/lists.js`.
- React: the modal store keeps the row (`openModal(name, row)`, `useModalRow`); `cardRow` in `JsxContext` makes the
  card pass `row`; `recordTemplates` reads `useModalRow()` for `clicked` records.

## Routes with changing parts (`model/routes.ts`)

- `/user/:id` is an ordinary page path. `matchPage` (exact first, then
  patterns) is used by Preview, the public view, static links
  (`sitePages.linkToFiles`, applied again after data is filled) and the React
  export (`tanstackPath`, `PARAMS_ATTR`). Address templates stay untouched until
  the data is expanded.

## Editing React markup (`export/react/jsxEdit/`)

- The reverse of the JSX writer, for the markup it writes: `parseJsx` ->
  `applyMarkup(doc, rootId, markup, others)`. Children are aligned by kind
  (longest common run) so an inserted element does not recreate its siblings.
  Matched elements keep id, styles, `hidden` and `data-fe-*` attributes; the
  `fe-<id>` class is dropped on the way in (the export regenerates it).
  `others` are the other components' element ids: their elements are opaque
  blocks. If the JSX writer learns new constructs, teach `jsxParse` the same ones
  (or keep them as blockers) and keep the "unedited code changes nothing" test.

## React view (`export/react/componentViews.ts`, `sidebar/code/ReactView.tsx`)

- Every generated component file records the element ids it was made from
  (`ComponentFile.ids`: a part's root, a repeated item's group, a list box, its
  card template, a form, a page). The builders push `{ path, name, ids }` into an
  optional `origins` array, so the editor can answer "which file is this
  element?" without re-deriving the export's naming. When several files share an
  element (a form that is a whole part) the later, more specific one wins.

## Panels (`sidebar/`, `inspector/`)

- `Sidebar.tsx` is a vertical rail + one panel (`SidePanel`: layers, add, pages,
  design, data, code). `Inspector.tsx` splits the selected element's sections
  into `InspectorTab`s (design / actions / more, in `view.store`); put a new
  section in the tab that matches its question: how does it look, what does it
  do, or is it rarely needed.

## Colors (`model/palette.ts`)

- A global color change is a pure `PageDoc -> PageDoc` function (`replaceColor`,
  `setThemeColor`) over `doc.css` (declaration blocks only) and every node's
  style values and paint attributes. Untouched nodes keep their identity.
  `--var: #color` declarations are theme colors and are never changed by
  `replaceColor`.

## Layouts (`model/layouts.ts`)

- `applyLayout(doc, kind, replaceHeader)` removes the old generated boxes
  (`data-fe-layout`) and CSS block (`/* tweak-layout */`), then inserts the
  new boxes before the pages. Menu links carry `data-fe-nav` + the page's
  condition attributes. React: `asRouterLink` (NavLink), `popups/jsxPopups`
  (`navProps`, ☰, Log out). Layout CSS uses `body:has(.lay-side)` because in
  the React project the boxes sit inside `#root`, not directly in `<body>`.

## Page guard (`model/pageGuard.ts`)

- `guardPage(doc, pageId, viewer)` mirrors the React route guards for
  `SafePageFrame` (Preview, public view) and `siteFiles.withGuard` (static
  download). Change both when the React guard rules change.

## Pop-ups and ask first (`model/popups.ts`)

- Plain attributes: `data-fe-modal`, `data-fe-open`, `data-fe-close`,
  `data-fe-ask`. Visitors: `serialize/popupPlayer.ts` (in `forVisitors`).
  React: `JsxContext.show.ui` collects what a file used (Modal, openModal,
  askFirst…) and `showImport` writes the imports; `popups/jsxPopups.ts`
  (`modalNode`, `clickAttrs`) writes `<Modal>` and one combined `onClick`;
  `popups/uiTemplates.ts` has the ui files. The store file is `popup.ts`, not
  `modal.ts`, so it never differs from `Modal.tsx` only by case.

## Update data on click (`model/updateClicks.ts`, `serialize/updatePlayer.ts`)

- `data-fe-update` is JSON `{ source, item: "clicked" | { id }, changes: [{ field, op: set|toggle|add, value }] }`. Only sources with an
  `api` can be chosen; the item address is `itemUrl` or `<url>/:id` (`itemAddress`). Keep the three places in step when the request
  shape changes: `updatePlayer` (browser), `dataUpdate.updateSource` (React) and `UpdateChanges` (which ops are allowed).
- A card that updates its own item must know which row it is: `expandDataLists` marks such cards like cards that open a pop-up
  (`data-fe-item`, `data-fe-from`); in React the card takes the whole `row` (like `modalRow`).

## Flag clicks (`model/flagClicks.ts`, `serialize/flagPlayer.ts`)

- A click changes a flag with `data-fe-flag="name"` + `data-fe-flag-mode="on|off|toggle"`. Static outputs: when the page has such a click,
  `forViewer` keeps boxes that depend on flags (`data-fe-flags`) and the player shows or hides them, so the flag state is the player's.
  React: `config/flags.ts` is the store; keep `Show`, the route guards (`isOn`) and `clickAttrs` (`setFlag`) in step with it.

## Sign-in pages (`model/authPages.ts`)

- `AUTH_PAGES` are HTML templates built from the form helpers in
  `model/formBlocks.ts`; `addAuthPages(doc)` adds the missing ones (by address).
  A form's `data-fe-submit` is its kind (`FormSettings.submit`); anything but
  `send` makes the React form call `useAuth()` (`forms/authForm.ts`) and makes
  `needsAuth` true. Preview/downloads only show the thank-you text for these.

## Forms (`model/forms.ts`)

- Fields come from the HTML (`fieldsOf(nodes, formId)`); only the editor
  extras are `data-fe-*`. Visitors: `serialize/formPlayer.ts` (in
  `forVisitors`). React: `export/react/forms/` writes one component per form
  (`JsxContext.forms` / `.form`; the JSX writer drops `name`/`action` and adds
  `register(...)` + `<FieldError>`). Forms are never grouped as repeated items
  (`findRepeats` skips them). Radio/checkbox `value` is kept (`attrTag`).

## Import and saving

- `features/import/PasteScreen` goes through `analyzePaste` (which calls
  `parsePastedCode`) and hands `onOpen(doc)` to the page, which calls
  `openDocument(doc)`.
- `features/editor/persistence/useAutosave(save, where)` is the single
  autosave loop, and every place a page is saved passes its own `save(doc)`:
  - Try-it passes `saveLocalDraft` (localStorage, try/catch-safe).
  - Account projects will pass a Firestore save.
- `useSaveStore` holds the status that `SaveIndicator` shows.

## Export (`features/export`)

- **Reopening a React download**: `export/react/snapshot.ts` adds the hidden
  `.tweak/project.json` (the whole `PageDoc` + a fingerprint per generated file) to
  every whole-project React zip (`withSnapshot`, in `prepareReact`). `import/readProject.ts`
  reads a .zip (fflate) or a chosen folder, `readSnapshot` restores the doc and lists
  files changed since, and `ReactProjectOpener` (paste screen) shows the warning.
  Projects without the file are refused with a plain message; Tweak does not parse
  arbitrary React code. Bump `VERSION` in `snapshot.ts` when `PageDoc` changes in a way old
  snapshots can't be read.

- Every format starts from `buildPageParts(doc, onlyId?)` in `editor/model/serialize`:
  - `partsToSingleFile` makes the .html, copy, and Preview.
  - `partsToSplitFiles` + `zipFiles` make the .zip.
  - `prepareReact` (lazy `export/react/buildReactProject`) makes a Vite +
    React + TypeScript project: `jsxWriter` writes JSX from nodes (it is not
    an HTML serializer: JSX rules differ), `repeats` finds same-shape
    siblings and turns differing text/attributes into props, `componentFiles`
    writes one file per part plus item components, `pageScripts` decides
    which scripts move to `public/scripts` and run after mount.
  - `capturePng(id | null)` takes the picture inside the live frame: the app
    sends its bundled html-to-image once (`loadCapture`), then asks `capture`.
- `exportActions.ts` has one `prepare…` function per button, each
  returning a `deliver()` step. The dialog prepares the file, then calls
  `gate.consume()`, then delivers it.
- `DownloadGate` (`downloadGate.ts`) is chosen by the page:
  - Try-it passes `signin`.
  - Saved pages pass `counted` (`workspace/useDownloadGate`, backed by
    `recordDownload`).
  - `open` is only for dev and e2e.
- `PreviewOverlay` runs the page in `sandbox="allow-scripts allow-forms
  allow-popups allow-modals"`. **Never add allow-same-origin to Preview or
  to public page viewers.**

## User guide (`features/guide`)
Data-driven: `content/*.ts` hold groups of topics made of simple blocks (p, steps,
list, tip, note, table, figure). `QuickGuide` shows each topic's `brief`;
`FullGuide` renders every block with anchors. Routes `/guide`, `/guide/full`.
Pictures are in `public/guide/` (SVG diagrams, real screenshots from
`e2e/guide-shots.mjs`). The SVG diagrams are drawn by `scripts/guide-art/` (one
file per topic group, helpers in `kit.mjs`); every topic starts with a figure.

## Reusable components (`model/reuse/`)

- A main component is a box with `data-fe-component="Name"`; a copy (instance) is a real copy of its boxes in the page:
  the top box has `data-fe-instance="<main id>"`, every box has `data-fe-of="<id of the main box it copies>"`. Because copies
  are plain nodes, everything works on them (editing in place, data wiring, drag, duplicate).
- `propagate(prev, next)` runs inside `useDocStore.commit` (one undo step): for each main component whose boxes changed
  it applies the change to every copy as a three-way merge: a copy's attribute, style, hidden flag or word is replaced only
  when it still equals the main component's OLD value. Structure (boxes added, removed, moved) follows the main component;
  a copy's own words survive where positions line up. A deleted main component detaches its copies.
- Outputs: `stripComponents` (from `forVisitors` and both React builders) drops main components and the bookkeeping; the
  `.tweak` snapshot keeps them, so a reopened project still has its components.
- Looks: each look of a component is its own main component (same `data-fe-component` name, its own `data-fe-variant`);
  boxes share `data-fe-key` across looks. A copy follows one look; `swapLook` rebuilds it from another look and re-applies
  what the copy changed (a diff against its old main, by key). Parts: `data-fe-part` on a main box names an option; a copy
  hides it with the node's `hidden` flag (kept by the merge like any other change).
- Account library: `reuse/entry.ts` turns a component (all looks, boxes keyed) into a `LibraryEntry` with the CSS it needs
  (`pickCss`: rules for its classes, ids, tags and `data-ui-*` hooks, plus `:root`, `*`, @font-face, @keyframes). `addEntry` and
  `updateFromEntry` put it into a page (new ids; update reuses ids by `data-fe-key` so `propagate` carries the change to
  copies). A linked main has `data-fe-library="<id>@<version>"`. Storage is `tweaks_components` through
  `workspace/api/componentLibrary.ts`, reached only by dynamic import from `actions/libraryActions.ts` (Firebase stays lazy).
- Rules: no component inside a component (one `data-fe-of` per box); a copy's data choice (`data-fe-record/row`) is just
  another attribute the merge keeps when the copy changed it.

## Ready-made widgets (`model/widgets/`, `inspector/widgets/`)

- `registry.ts` lists the Add blocks; `blocks*.ts` build their HTML; `css.ts` adds one marked page-CSS
  block per kind (`/* tweak-ui tabs */`, plus the shared `base`) with the first widget (`actions/widgetActions.ts`
  does CSS + boxes + connecting in one undo step).
- Behaviour hooks are `data-ui` (kind), `data-ui-tab/panel/option/day/...`. The initial state is complete in
  the markup (first panel open, others `hidden`; the calendar's 42 day buttons for the month it was added in),
  so the editor shows it without a script; `runtime/*.js` only reacts to clicks and keys (delegated on the
  document) and a `MutationObserver` sets up parts that appear later. Added through `serialize/widgetPlayer.ts`
  (`forVisitors`) and `export/react/widgetFiles.ts` (`src/widgets.ts`, `// @ts-nocheck`).
- Search and filters: lists / tables carry `data-ui-filterable="name"`, searches and filters `data-ui-for="name"`
  (`connect.ts`). Items are the rows of a table or the children of a list; matching is by text, or by an attribute
  when a filter has `data-ui-by="field"` (then the row design gets `data-fe-bind-data-<field>`, `filterData.ts`).
- A filter's choices can come from another source (`data-ui-choices="source.field"`): chips and tick boxes are then a
  live `data-fe-list` of that source inside the filter (`chipsLiveInner`), so lists, Preview and React all fill them;
  `filterTargets` ignores lists inside a filter.
- Editor: `useRevealWidgets` (selection → frame `attr`/`unattr`) shows hidden panels and pop-overs.
- Keep the three places in step when a widget changes: the HTML builder, the runtime JS, and (if it adds
  something new to store) the inspector panel and `edit.ts`.

## Accounts (`features/auth`)

- `useAuthStore` holds `{ user, status }`, where status is
  `loading | signedIn | signedOut | unconfigured`. `startAuth()` attaches the
  Firebase listener once, lazily.
- Call Firebase only through `authService()` (a dynamic import), never by
  importing `firebase/*` in UI code, so bundles stay small.
- `getIdToken()` is how other services, such as the uploads Worker, prove who the user is.

## Workspace (`features/workspace`) and data

See `.claude/skills/firebase-data/SKILL.md` for the collections and the
rule invariants.

- `api/projectQueries` (reads), `api/projectMutations` (batched writes),
  `api/projectContent` (the page JSON and autosave).
- `ProjectEditorPage` reuses the same editor pieces as Try-it and only swaps
  the save function (`useAutosave(save, 'to your account')`).

## Code tab (`features/editor/sidebar/code`)

- `shared/code/CodeEditor` wraps CodeMirror 6 (html / css / javascript) for every code box
  (paste screen, Add, Code tab, Edit code); `LazyCodeEditor` is the `lazy()`-loaded form,
  so the `codemirror` chunk downloads only when the Code tab opens.
- It has one-way sync: typing calls `onChange` (debounced 400 ms in
  `CodePanel`) and then `updateDoc` with a coalesce key. When the doc changes
  elsewhere (undo), the new text is dispatched into CodeMirror.
- The Code tab stacks collapsible `CodeSection`s: Page code, Styles, and one
  per script.
- Page code is the whole source (`docToEditableSource`, which parses back
  with `parsePastedCode`), so applying it updates HTML, CSS and JS together.
- `HtmlCodeBox` edits a part's HTML (or the whole page) and applies it on
  **Apply** via `applyHtml`, never while typing. It's used by the Code tab
  (Page HTML) and the quick-actions "Edit code" dialog.
- Every code box has Fold all / Unfold all (`foldAll` / `unfoldAll`), and
  the gutter arrows come from `basicSetup`.
- CodeMirror's `.cm-content` is `contenteditable`, so the global editor
  shortcuts ignore keys typed in it, and Ctrl+Z inside it is CodeMirror's own undo.

## Pictures and thumbnails (`features/assets`, `workers/assets`)

```
browser ──POST /upload (Bearer Firebase ID token, raw image)──▶ Worker ──▶ R2
        ◀──────────── { url: https://<worker>/a/<key> } ─────────────┘
page <img src> ──GET /a/<key>──▶ Worker (nosniff, CSP default-src 'none')
```

- `pictureFromFile(file)` uploads when `canUpload()` is true (the flag
  `enable_uploads` = `VITE_ASSETS_URL` is set, and the user is signed in).
  Otherwise it embeds a picture under 400 KB as a data address.
- `useThumbnail(projectId)` is called after saves. It runs
  `capturePng(null, { pixelRatio: 0.35, topOnly: true })`, uploads the result
  as a `thumbnail`, and stores it with `setProjectThumbnail`.

## State (`features/editor/store`)

| Store | Holds |
| --- | --- |
| `doc.store` | `doc`, undo `past`/`future` (capped at `HISTORY_LIMIT`), `version` |
| `selection.store` | selected / hovered / text-editing node id |
| `view.store` | breakpoint, zoom, preview mode, side panel |

Edits go through `actions/*` → `commit()`. Repeated edits of the same property
within 800 ms merge into one undo step, so dragging a slider is a single undo.
