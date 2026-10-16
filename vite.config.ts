import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { seoPlugin } from './scripts/seo/vitePlugin.ts'

export default defineConfig(({ mode }) => ({
  // VITE_SITE_URL (from .env or the host's settings) is the address of the deployed site: sitemap, canonical links, share pictures.
  plugins: [react(), seoPlugin(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL?.trim().replace(/\/+$/, '') ?? '')],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // The Firebase chunk is ~550 kB (160 kB gzipped) and only loads on account
    // pages. Anything else this big should be split — so the limit sits just above it.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Heavy libraries get their own chunks so the dashboard loads fast.
        manualChunks(id: string) {
          // Analytics (+ its installations SDK) is its own chunk: it loads after the page is idle.
          if (/node_modules\/(@firebase\/(analytics|installations)|firebase\/analytics)/.test(id)) return 'firebase-analytics'
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase'
          if (id.includes('node_modules/konva') || id.includes('node_modules/react-konva')) return 'konva'
          if (id.includes('node_modules/quill')) return 'quill'
          if (id.includes('node_modules/@codemirror') || id.includes('node_modules/codemirror') || id.includes('node_modules/@lezer')) return 'codemirror'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
}))
