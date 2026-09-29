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
    editor/
      model/      page model: types, parse (paste -> nodes), tree ops, serialize (nodes -> html/css)
      store/      doc (with undo), selection, view
      actions/    user-level edits (setStyle, deleteNode, insertHtml...) — UI calls these
      frame/      iframe renderer that mirrors the model into real DOM
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

- `EditorFrame` loads a shell document (fonts, CSS, trusted scripts) into a
  sandboxed iframe (`allow-same-origin allow-scripts`, no forms/popups/navigation).
- `createFrameRenderer` builds the body DOM from nodes and then **patches only
  the nodes whose object changed**. It subscribes straight to the doc store, not
  through React.
- While editing, page JavaScript is **off**. Only allowlisted style libraries
  run (`model/scripts.ts`: the Tailwind CDN, plus a `tailwind.config` that is
  plain data). Inline `on*` handlers and `javascript:` links are never set.
  Everything runs in Preview, which is a separate sandbox with no same-origin access.
- The iframe has `pointer-events: none`; the Konva overlay handles all pointer input.

## Canvas and overlay (`features/editor/canvas`)

```
.canvas (container, measured with ResizeObserver)
 ├─ .page  → EditorFrame (iframe, width = breakpoint width, CSS-scaled)
 └─ Konva Stage (same size as the container, on top, gets all pointer input)
```

- `Canvas` works out `scale` (Fit = the page width fills the area) and the
  frame's `left`/`top`. Together these are a `FramePlacement`, used for every
  coordinate conversion (`geometry.ts`).
- `nodeIdAt(x, y)` maps overlay pixels to frame pixels, calls
  `elementFromPoint` inside the iframe, and reads `data-fe-id`.
- `useTrackedBox(id)` measures the hovered and selected element on every
  animation frame. It is cheap, and it follows scrolling, loading images and
  animations without extra wiring.
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
- `useComputedStyle(id)` snapshots `getComputedStyle` one frame after each
  edit or screen-size change.
- Text inputs use `useDraft` (prop → local draft; save on Enter or blur).
  This avoids setState-in-effect.

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
  - `capturePng(id | null)` takes the picture from the live iframe.
- `exportActions.ts` has one function per button, so new formats plug in there.
- `PreviewOverlay` runs the page in `sandbox="allow-scripts allow-forms
  allow-popups allow-modals"`. **Never add allow-same-origin to Preview or
  to public page viewers.**

## State (`features/editor/store`)

| Store | Holds |
| --- | --- |
| `doc.store` | `doc`, undo `past`/`future` (capped at `HISTORY_LIMIT`), `version` |
| `selection.store` | selected / hovered / text-editing node id |
| `view.store` | breakpoint, zoom, preview mode, side panel |

Edits go through `actions/*` → `commit()`. Repeated edits of the same property
within 800 ms merge into one undo step, so dragging a slider is a single undo.
