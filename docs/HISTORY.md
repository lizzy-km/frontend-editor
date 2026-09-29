# History

One entry per feature branch, newest first. Each branch is merged into `main`
with `--no-ff`, so `git log --first-parent main` shows one merge per feature.

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
