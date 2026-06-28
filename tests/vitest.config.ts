import { defineConfig } from 'vitest/config'
import path from 'node:path'

const UI_SRC = path.resolve(__dirname, '..', 'packages', 'ui', 'src')
const src = (sub: string) => path.resolve(UI_SRC, sub)

export default defineConfig({
  resolve: {
    alias: {
      '@/': `${UI_SRC}/`,
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
