---
name: editor-model
description: How frontend-editor's page model, renderer and edit precedence work — read before touching features/editor/model, store, actions or frame (parsing pasted code, tree ops, export, iframe renderer, CSS layering, script safety).
---

# Editor model: rules that must hold

The full explanation is in `docs/ARCHITECTURE.md`. These are the invariants
that break things if you ignore them.

1. **The node map is immutable.** Never mutate a node. Tree helpers in
   `model/tree/treeOps.ts` return new maps, and unchanged nodes must keep the
   same object identity. The renderer and undo both depend on that.
2. **`children` is the only list of child nodes.**
3. **The root is the `<body>` node** (`doc.rootId`). It can't be deleted, moved or duplicated.
4. **The original CSS stays text.** Edits go to `node.styles[breakpoint]` and
   never back into `doc.css`, except through the Advanced/Code editor.
5. **Precedence:** pasted CSS goes inside `@layer page`; edits are doubled
   selectors, `.fe-<id>.fe-<id>` on export and `[data-fe-id]` doubled in the
   editor. Keep the editor and export specificity identical.
6. **Scripts:** nothing from the page executes while editing except
   `runsWhileEditing()` in `model/scripts.ts`. The renderer skips `on*`
   attributes and `javascript:` URLs. The Preview/public view is a separate
   sandbox that never has `allow-same-origin`.
7. **One edit = one `commit`.** Continuous inputs pass a `coalesceKey`.
8. **Export and the editor share the serializers** in `model/serialize`.
   Don't write a second HTML serializer.

9. **Canvas coordinates:** always convert through `canvas/geometry.ts` with a
   `FramePlacement`. Never mix iframe and overlay pixels by hand.
10. **Konva shapes that follow elements are positioned imperatively**
    (`DraggableBox`). Don't pass x/y/width/height as React props, because it
    breaks drag and resize.
11. **Drop rules** (`canvas/dropTarget.ts`): over a sibling, reorder; over a
    container, nest; over a leaf, go before or after it. Change them there
    only, and check them in the browser.
12. **Browser check:** tsc/vitest can't see canvas bugs. For canvas changes,
    run the app (`npx vite --port 5317`) and drive `/try` with playwright-core
    against the local Chrome. Both real canvas bugs so far were only visible
    there.

## Adding a new kind of edit
Write a function in `features/editor/actions/` that calls `updateNodes` or
`updateDoc`, then add a test in `model/*.test.ts` if it adds new tree logic.
