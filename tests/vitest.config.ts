import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['unit/**/*.test.{js,ts}'],
    exclude: ['node_modules', 'e2e', 'test-results', 'playwright-report'],
    coverage: {
      provider: 'v8',
      include: ['../api/**/*.{js,ts}'],
      exclude: ['../api/**/*.spec.{js,ts}', '**/node_modules/**'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
