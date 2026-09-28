import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Heavy libraries get their own chunks so the dashboard loads fast.
        manualChunks(id: string) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase'
          if (id.includes('node_modules/konva') || id.includes('node_modules/react-konva')) return 'konva'
          if (id.includes('node_modules/quill')) return 'quill'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
