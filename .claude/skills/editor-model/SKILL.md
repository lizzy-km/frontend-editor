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
12. **Browser check:** tsc/vitest can't see canvas bugs. For canvas or text
    changes, start `npx vite --port 5317` and run `npm run e2e` (playwright-core
    on the local Chrome, scripts in `e2e/`). Add a check there for new canvas
    behavior. Every real canvas bug so far was only visible there.
13. **Konva events:** don't rely on Konva `dblclick`, because the target
    shape changes between clicks. Use `event.evt.detail >= 2` in `onClick`.
14. **Quill:** only elements passing `isTextEditable` may open in Quill.
    Save only when the output differs from Quill's first output. Keep
    `classSpan` registered or colored words lose their class.
    `survivesQuill` in `model/tree/textRules.ts` is the list of what Quill
    keeps exactly: bare formatting tags, plain links, and spans whose only
    attribute is a class. Anything else, SVG text included, falls back to
    the Words list. Add to it only after a round-trip test.
15. **Canvas wrappers use `overflow: clip`, never `hidden`.** A hidden box
    can be scrolled by code, and Chrome scrolls it when content inside the
    iframe calls `scrollIntoView()`. That shifts the page under the overlay
    and breaks hit-testing.
16. **Editor-only DOM state** (such as opening `<details>` so answers can be
    edited) is applied to the frame DOM, never to the model, and undone when
    the selection changes. See `canvas/useRevealDetails.ts`.
17. **Test with real pages.** `e2e/fixtures/*.html` holds real AI output.
    When a pasted page misbehaves, add it there with a check in `e2e/`.

## Adding a new kind of edit
Write a function in `features/editor/actions/` that calls `updateNodes` or
`updateDoc`, then add a test in `model/*.test.ts` if it adds new tree logic.
