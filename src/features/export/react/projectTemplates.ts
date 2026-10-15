/** The fixed files of the exported Vite + React + TypeScript project (same versions this app uses). */

/** package.json; `extra` adds libraries (a router, React Query…). */
export function packageJson(name: string, extra: Record<string, string> = {}): string {
  return `${JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'tsc -b && vite build', preview: 'vite preview' },
    dependencies: { react: '^19.3.0', 'react-dom': '^19.3.0', ...extra },
    devDependencies: {
      '@types/react': '^19.3.0', '@types/react-dom': '^19.3.0', '@vitejs/plugin-react': '^6.1.1',
      typescript: '~5.9.0', vite: '^8.3.1',
    },
  }, null, 2)}\n`
}

export const TSCONFIG = `${JSON.stringify({
  compilerOptions: {
    target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'bundler',
    jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true, isolatedModules: true,
    noUnusedLocals: true, noUnusedParameters: true, types: ['vite/client'],
  },
  include: ['src'],
}, null, 2)}\n`

export const VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`

export const GITIGNORE = 'node_modules\ndist\n'

/** README part for data sources (src/data, src/api). */
export const DATA_README = `
## Data

- \`src/data/types.ts\`: one TypeScript type per data source.
- \`src/data/mockData.ts\`: the sample rows (global mock data).
- \`src/api/<name>.ts\`: \`fetchX\`, \`useX()\` (everything) and \`useXInfinite()\` (page by page) with React Query and axios.
- Copy \`.env.example\` to \`.env\`; set \`VITE_USE_MOCK=false\` to use the real API (and \`VITE_API_URL\` for addresses starting with "/").
- APIs that need a key: put the key in \`.env\` (the name is listed in \`.env.example\`). It is sent as a header with every request and is never written into the code. A website's visitors can still see it in their browser, so only use keys meant for websites (read-only or public keys), never a private server key. Restart \`npm run dev\` after changing \`.env\`.
- The API's answer is mapped to the typed items in \`toRow\` in each \`src/api/<name>.ts\` (the \`FIELDS\` list says where each field sits in the answer).
`

export function readme(title: string, components: string[], hasScripts: boolean): string {
  return `# ${title}

Made with Tweak: your page as a React + TypeScript project (Vite).

## Run it

1. Install Node.js 20 or newer from https://nodejs.org
2. In this folder, run \`npm install\`
3. Run \`npm run dev\` and open the address it shows (usually http://localhost:5173)

\`npm run build\` makes a \`dist/\` folder you can upload to any web host
(Vercel, Netlify, GitHub Pages…).

## What's where

- \`src/App.tsx\` puts the parts of the page in order.
- \`src/components/\` has one file per part: ${components.join(', ')}.
  Repeated items (cards, menu items, reviews…) have their own component, and
  their words, pictures and links are in a list at the top of the part that uses them.
- \`src/styles/page.css\` has all the styles, including your Tablet and Phone changes.
- \`index.html\` has the title, fonts and page settings.
- \`.tweak/\` is hidden and lets you open this project in Tweak again (Start page → Open a React project). Keep it.
${hasScripts ? `- \`public/scripts/\` has the page's own JavaScript, unchanged. \`src/runPageScripts.ts\`
  runs it once after React has put the page on screen. Moving these behaviours
  into React (state and event handlers) is a good next step.
` : ''}`
}
