/**
 * Phase B scaffold: TS port of server.py /api/data only.
 *
 * Runs on a different port (default 8081) so it can run alongside the
 * Python backend (8080) during the cutover. The UI in prod continues
 * to talk to Python until Phase D flips Caddy.
 *
 * Environment (reads .env from repo root via dotenv):
 *   GOOGLE_SHEET_ID                — same as Python
 *   GOOGLE_SERVICE_ACCOUNT_JSON    — same as Python
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

const app = new Hono()

app.use('*', logger())
app.use('/api/*', cors({ origin: '*' }))

app.get('/', (c) => c.text('@adu-dashboard/api — Phase B scaffold (read-only /api/data)'))
app.get('/health', (c) => c.json({ ok: true }))

app.get('/api/data', async (c) => {
  try {
    const data = await fetchFromSheets()
    return c.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/data failed:', message)
    return c.json({ error: 'Failed to fetch sheet data', message }, 500)
  }
})

const port = Number.parseInt(process.env.PORT ?? '8081', 10)
serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, ({ address, port }) => {
  console.log(`@adu-dashboard/api listening on http://${address}:${port}`)
})
