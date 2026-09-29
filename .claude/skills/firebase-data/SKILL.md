---
name: firebase-data
description: frontend-editor's Firestore data model, security-rule invariants (page limit counter, public/private), and bundle rules for Firebase imports. Read before touching features/workspace/api, features/auth, firestore.rules, billing plans, or anything that reads/writes Firestore.
---

# Firebase data: rules that must hold

## Collections
| Path | Who can read | What |
|---|---|---|
| `users/{uid}` | owner | `displayName, email, photoURL, plan ('free'|'pro'), projectCount, lastProjectOp, createdAt` |
| `projects/{id}` | owner, or anyone if `isPublic` | `ownerId, ownerName, name, isPublic, thumbnailUrl, remixOf, createdAt, updatedAt` |
| `projectContent/{id}` | owner, or anyone if `isPublic` | `ownerId, isPublic (mirror), doc (JSON string of PageDoc), updatedAt` |

## Invariants
1. **The page counter only moves together with a project.** Create and delete are
   ONE `writeBatch`: the project and content docs, plus
   `users/{uid}.projectCount ±1` with `lastProjectOp = projectId`.
   `firestore.rules` check that the project really appears or disappears in
   that same batch. Never update `projectCount` any other way.
2. **Plan limits live in two places and must match:** `src/features/billing/plans.ts`
   (UI) and `maxProjects()` in `firestore.rules` (the real enforcement).
3. **`plan` is never writable by the client.** It can only be created as
   `'free'`. Upgrades must come from a trusted server (Admin SDK / Cloud
   Function) once billing exists.
4. **`isPublic` is mirrored** on `projectContent`, so read rules need no
   extra `get()`. Always change both in one batch (`setProjectPublic`).
5. **The page is stored as a JSON string** (`serializeDoc`), with a limit of
   about 900 KB because of Firestore's 1 MiB per document.
   `ProjectTooBigError` gives the user a friendly message. If pages outgrow
   that, move content to R2 behind the same `loadProjectContent` /
   `saveProjectContent` functions.
6. **Public pages are untrusted code for the viewer.** Render them only in a
   sandbox WITHOUT `allow-same-origin`, like Preview does.

## Bundle rule
- `@/lib/firebase` (the SDK) may only be imported from lazily-loaded code:
  `features/auth/authService.ts`, `userProfile.ts`, `features/workspace/api/*`
  and gallery API files.
- UI that just needs to know whether Firebase is set up imports
  `@/lib/firebaseConfig`.
- To check, run `npx vite build`, then `grep -c firebase- dist/index.html`,
  which must print `0`.

## Testing rules
`npm run test:rules` runs `tests/rules/*.test.ts` against the Firestore
emulator (it needs Java and `firebase-tools`). Add a case for every rule
change. Rules can't be checked with tsc or unit tests.
