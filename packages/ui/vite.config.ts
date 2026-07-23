import { execSync } from 'node:child_process'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Bake the current git SHA into the bundle so the tier-3 profiler sink
// can attribute each perf event to the deploy that produced it. Falls
// back to 'dev' if git isn't available at build time (e.g. inside a
// container without .git). See packages/ui/src/utils/perfSink.ts.
const commitSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
})()

export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT_SHA__: JSON.stringify(commitSha),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // 127.0.0.1, not localhost: on Windows, `localhost` resolves to
        // ::1 (IPv6) first, but the dev backend (uvicorn server.py) binds
        // to IPv4 by default, causing 404s through the proxy.
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
