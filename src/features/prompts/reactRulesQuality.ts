/** Part 2 of the React prompt, last third: clean code, design, the README and the final check. */
export const REACT_RULES_QUALITY = `8. CLEAN CODE
- TypeScript strict: no "any", no non-null "!" assertions, casts only to narrow parsed JSON. Exported functions and components have explicit prop and return types. Use "type" for object types. Named exports everywhere, except default exports for lazy pages.
- Small functions that do one thing (under about 40 lines) and components under about 120 lines. Pull repeated logic into hooks (src/shared/hooks, features/*/hooks) or helpers (src/shared/lib). Use constants instead of magic numbers and strings, early returns instead of deep nesting, and descriptive names (isLoading, filteredProducts, handleSubmit).
- Put a one-line comment above every exported function, hook and component saying what it does in plain words. No other comments unless something is surprising.
- No console.log, no dead code, no TODOs, no commented-out code, no unused imports or variables (noUnusedLocals is on).
- State stays local; context is only for sign-in. Do not store values you can calculate. useEffect is only for syncing with the outside world (document title, event listeners) and always cleans up.
- Errors are shown to people in plain words, never as raw error objects or stack traces.
- Styles: CSS Modules per component, and global variables in src/styles/tokens.css (colours, font families, radius, spacing scale, shadows). No inline style attributes except for dynamic values, and no !important.

9. DESIGN
- One clear visual idea that fits the subject (mood, palette, type pairing, a recurring motif) carried through every page, written as variables in tokens.css and a Google Fonts link in index.html.
- A striking hero on Home: a big expressive headline (clamp()), a strong photo or layered background, a short line and one standout button. Use shared/ui components (Button, Card, Input) so every page looks like the same product. Vary the layouts from section to section (split layouts, bento grids, an image band), alternate light and tinted sections, add soft shadows, badges and gentle hover and transition motion (150 to 400ms).
- A footer with the name, short contact details, links and the current year.

10. README.md (written in full as one of the files)
- What the project is; the run commands (Node.js 20 or newer, npm install, npm run dev, npm run build); the two demo accounts; a map of the folders; how to switch to a real API (VITE_USE_MOCK=false, VITE_API_URL and the endpoints it expects); how to add a page and how to add a feature.

11. BEFORE YOU ANSWER, CHECK
- "npm install && npm run build" would pass: every file that is imported is in the tree, everything that is imported is exported, there are no type errors in strict mode, and no unused variables.
- Every file in the FILE TREE appears below as "FILE: ..." and nothing is shortened.
- Every link and navigation path matches a route; the protected page sends signed-out people to /login and back; the demo accounts work.
- It works at 1440px, 1024px, 768px, 390px and 360px wide, and the code reads like it was written by a careful senior engineer.`
