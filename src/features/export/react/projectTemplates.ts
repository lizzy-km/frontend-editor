/** The fixed files of the exported Vite + React + TypeScript project (same versions this app uses). */

export function packageJson(name: string): string {
  return `${JSON.stringify({
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'tsc -b && vite build', preview: 'vite preview' },
    dependencies: { react: '^19.3.0', 'react-dom': '^19.3.0' },
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

export const MAIN_TSX = `import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/page.css'

// No <StrictMode>: the page's own scripts (public/scripts) expect the page to be put on screen once.
createRoot(document.getElementById('root')!).render(<App />)
`

export const GITIGNORE = 'node_modules\ndist\n'

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
${hasScripts ? `- \`public/scripts/\` has the page's own JavaScript, unchanged. \`src/runPageScripts.ts\`
  runs it once after React has put the page on screen. Moving these behaviours
  into React (state and event handlers) is a good next step.
` : ''}`
}
