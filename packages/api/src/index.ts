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

import { appendExpenseRow, fetchADUData } from './sheets.js'
import { categoryFor } from './phase-categories.js'
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

// /api/data and /api/refresh are behaviourally identical (matches Python:
// fetch_adu_data is the body of both endpoints there too — both always
// hit sheets, neither reads any cache). Both use the wrapper that falls
// back to canonical data if Sheets is down.
app.get('/api/data', async (c) => c.json(await fetchADUData()))
app.get('/api/refresh', async (c) => c.json(await fetchADUData()))

app.get('/api/whitelist-check', (c) => {
  const email = c.req.query('email') ?? ''
  return c.json({ email: email.trim().toLowerCase(), whitelisted: isWhitelisted(email) })
})

app.get('/api/sheets-link', (c) => {
  const email = c.req.query('email') ?? ''
  return c.json(sheetsLinkResponse(email))
})

// POST /api/expenses — append a change-order row to the Phase Canonical
// sheet. Whitelist-gated; the email IS the auth (matches Python's
// single-tenant trust model). Validation messages, status codes, and
// success payload exactly match server.py:add_expense_item.
app.post('/api/expenses', async (c) => {
  type Body = { email?: unknown; phase?: unknown; task?: unknown; cost?: unknown }
  let body: Body
  try {
    body = await c.req.json<Body>()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!isWhitelisted(email)) return c.json({ error: 'Not authorized' }, 403)

  const phase = body.phase
  if (typeof phase !== 'number' || !Number.isInteger(phase) || phase < 1 || phase > 7) {
    return c.json({ error: 'phase must be an integer 1-7' }, 400)
  }

  const task = typeof body.task === 'string' ? body.task.trim() : ''
  if (!task) return c.json({ error: 'task is required' }, 400)

  const costRaw = body.cost
  const cost = typeof costRaw === 'number' ? costRaw : Number(costRaw)
  if (!Number.isFinite(cost) || cost < 0) {
    return c.json({ error: 'cost must be a non-negative number' }, 400)
  }

  const result = await appendExpenseRow(phase, categoryFor(phase), task, cost)
  if (!result.ok && result.kind === 'sheet_full') {
    return c.json({ error: 'Phase Canonical sheet is full (60 rows)' }, 507)
  }
  if (!result.ok) {
    console.error('Sheets write failed:', result.error)
    return c.json({ error: `Sheets write failed: ${result.error.message}` }, 502)
  }

  console.log(`✅ Change order added to row ${result.row}: phase=${phase} task='${task}' cost=$${cost}`)

  // Match Python: returns refreshed data so the UI can re-render without
  // a follow-up fetch. Uses the fallback wrapper so a transient sheet
  // failure here doesn't 500 (the write already succeeded — surfacing
  // canonical data is the better failure mode).
  const data = await fetchADUData()
  return c.json({ success: true, message: 'Change order added', data })
})

// Bind 0.0.0.0 so Docker's published port can reach us. In compose the
// published port is restricted to 127.0.0.1 on the host, and outside
// Docker (local `npm run api:dev`) binding all interfaces is fine since
// the dev box's firewall handles external exposure.
const port = Number.parseInt(process.env.PORT ?? '8081', 10)
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, ({ address, port }) => {
  console.log(`@adu-dashboard/api listening on http://${address}:${port}`)
})
