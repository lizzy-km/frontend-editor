import { defineConfig } from 'vitest/config'

// Security-rules tests run against the Firestore emulator: `npm run test:rules`.
export default defineConfig({
  test: { include: ['tests/rules/**/*.test.ts'], environment: 'node', testTimeout: 20000 },
})
