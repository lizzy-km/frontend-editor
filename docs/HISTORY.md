# History

One entry per feature branch, newest first. Each branch is merged into `main`
with `--no-ff`, so `git log --first-parent main` shows one merge per feature.

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
