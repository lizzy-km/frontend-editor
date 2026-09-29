# frontend-editor

This is an editor for everyday people, not coders or designers. They paste
HTML/CSS/JS from an AI, change it by clicking, and export it. It is not a
page builder.

- Read `docs/ARCHITECTURE.md` before larger changes.
- For every feature, follow `.claude/skills/add-feature/SKILL.md`: one git
  branch per feature, files of at most 150 lines, functions of at most 100
  lines, plain-language UI, and verification with
  `npx tsc -b && npx eslint . && npx vitest run && npx vite build`.
- Before touching Firestore code, auth or `firestore.rules`, read
  `.claude/skills/firebase-data/SKILL.md`.
- Before touching `src/features/editor/model|store|actions|frame`, read
  `.claude/skills/editor-model/SKILL.md`.
- After each feature, update `docs/HISTORY.md` (and ARCHITECTURE/README when relevant).
