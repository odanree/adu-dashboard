/**
 * TS port of server.py — runs alongside the Python backend during the
 * Steepwell-shape migration cutover.
 *
 * Phase B: GET /api/data.
 * Phase C1: GET /api/refresh, /api/whitelist-check, /api/sheets-link.
 *
 * Runs on port 8081 by default (Python is 8080) so both can coexist in
 * dev. UI in prod still talks to Python until Phase D flips Caddy.
 *
 * Environment (reads .env from repo root via dotenv):
 *   GOOGLE_SHEET_ID                — same as Python
 *   GOOGLE_SERVICE_ACCOUNT_JSON    — same as Python
 *   VITE_WHITELISTED_EMAILS        — same as Python (or WHITELISTED_EMAILS)
 *   PORT                           — defaults to 8081
 */

import { serve } from '@hono/node-server'
import { config as loadDotenv } from 'dotenv'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { resolve } from 'node:path'

// Load .env from repo root (two levels up from packages/api/src/)
loadDotenv({ path: resolve(import.meta.dirname, '..', '..', '..', '.env') })

import { fetchFromSheets } from './sheets.js'
import { isWhitelisted, sheetsLinkResponse } from './whitelist.js'

const app = new Hono()

app.use('*', logger())
app.use('/api/*', cors({ origin: '*' }))

// Health: matches server.py — same body, same Cache-Control, both GET and HEAD
// (the Hetzner / Caddy healthcheck issues HEAD against /).
const healthHandler = (c: import('hono').Context) => {
  c.header('Cache-Control', 'no-store')
  return c.json({ status: 'ok', message: 'ADU Dashboard API is running' })
}
app.on(['GET', 'HEAD'], ['/', '/health'], healthHandler)

app.get('/debug/env', (c) => {
  const sa = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? ''
  return c.json({
    WHITELISTED_EMAILS:
      process.env.VITE_WHITELISTED_EMAILS ?? process.env.WHITELISTED_EMAILS ?? 'NOT SET',
    PORT: process.env.PORT ?? 'NOT SET',
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? 'set' : 'NOT SET',
    GOOGLE_SERVICE_ACCOUNT_JSON: sa ? `set (${sa.length} chars)` : 'NOT SET',
  })
})

// Stub matching server.py — values are hardcoded on the Python side too.
// If/when the UI needs real per-row sign-off tracking, that's a separate
// feature on top of the canonical sheet, not a parity item.
app.get('/api/expenses-signoff', (c) =>
  c.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    signOff: {
      totalAmount: '$9,494.51',
      signedOffAmount: '$0.00',
      pendingAmount: '$9,494.51',
      signedOffCount: 0,
      pendingCount: 7,
      totalCount: 7,
      percentComplete: 0,
    },
  }),
)

const handleData = async () => {
  try {
    const data = await fetchFromSheets()
    return { status: 200 as const, body: data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Sheet fetch failed:', message)
    return { status: 500 as const, body: { error: 'Failed to fetch sheet data', message } }
  }
}

// /api/data and /api/refresh are behaviourally identical for now — the
// in-memory/file cache that would distinguish them lands in Phase C4.
app.get('/api/data', async (c) => {
  const r = await handleData()
  return c.json(r.body, r.status)
})
app.get('/api/refresh', async (c) => {
  const r = await handleData()
  return c.json(r.body, r.status)
})

app.get('/api/whitelist-check', (c) => {
  const email = c.req.query('email') ?? ''
  return c.json({ email: email.trim().toLowerCase(), whitelisted: isWhitelisted(email) })
})

app.get('/api/sheets-link', (c) => {
  const email = c.req.query('email') ?? ''
  return c.json(sheetsLinkResponse(email))
})

const port = Number.parseInt(process.env.PORT ?? '8081', 10)
serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, ({ address, port }) => {
  console.log(`@adu-dashboard/api listening on http://${address}:${port}`)
})
