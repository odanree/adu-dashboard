import React, { Profiler } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from './Router'
import { onProfilerCommit } from './utils/perfSink'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

// <Profiler> wraps App in both dev and prod. Only commits slower than
// SLOW_MS (16ms) get shipped — see utils/perfSink.ts. Overhead is
// microseconds per commit; the sink batches to sendBeacon so nothing
// blocks the render loop. Same shape as wildlife-detector's tier-3.
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Profiler id="App" onRender={onProfilerCommit}>
        <Router />
      </Profiler>
    </QueryClientProvider>
  </React.StrictMode>,
)
