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

## State (`features/editor/store`)

| Store | Holds |
| --- | --- |
| `doc.store` | `doc`, undo `past`/`future` (capped at `HISTORY_LIMIT`), `version` |
| `selection.store` | selected / hovered / text-editing node id |
| `view.store` | breakpoint, zoom, preview mode, side panel |

Edits go through `actions/*` → `commit()`. Repeated edits of the same property
within 800 ms merge into one undo step, so dragging a slider is a single undo.
