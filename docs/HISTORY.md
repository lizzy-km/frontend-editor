# History

One entry per feature branch, newest first. Each branch is merged into `main`
with `--no-ff`, so `git log --first-parent main` shows one merge per feature.

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
