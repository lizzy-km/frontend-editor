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
- `useComputedStyle(id)` asks the frame for `getComputedStyle` one frame after
  each edit or screen-size change (edits reach the frame first: messages keep
  their order).
- Text inputs use `useDraft` (prop → local draft; save on Enter or blur).
  This avoids setState-in-effect.

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
- `identifyUser(uid, plan)` sets the user id and `plan`/`signed_in`
  properties (from auth and `getUsage`).
- Edits are counted per undo step (`editor/actions/editStats.ts` uses the same
  800 ms coalescing window as the doc store).

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

- Every format starts from `buildPageParts(doc, onlyId?)` in `editor/model/serialize`:
  - `partsToSingleFile` makes the .html, copy, and Preview.
  - `partsToSplitFiles` + `zipFiles` make the .zip.
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

- `CodeEditor` wraps CodeMirror 6 (css / javascript) and is `lazy()`-loaded,
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
