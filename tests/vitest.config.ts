import { defineConfig } from 'vitest/config'
import path from 'node:path'

const src = (sub: string) => path.resolve(__dirname, '..', 'src', sub)

export default defineConfig({
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, '..', 'src')}/`,
      '@components': src('components'),
      '@services': src('services'),
      '@hooks': src('hooks'),
      '@types': src('types'),
      '@utils': src('utils'),
    },
  },
  test: {
    environment: 'node',
    include: ['unit/**/*.test.{js,ts}'],
    exclude: ['node_modules', 'e2e', 'test-results', 'playwright-report'],
  },
})
