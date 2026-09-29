import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Security-rules tests run against the Firestore emulator: `npm run test:rules`.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['tests/rules/**/*.test.ts'], environment: 'node', testTimeout: 20000, fileParallelism: false },
})
