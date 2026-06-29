/**
 * Google Sheets client + parser.
 *
 * Mirrors the layout used by server.py:fetch_from_sheets exactly so the
 * JSON shape returned by GET /api/data is byte-identical to Python's.
 *
 * Phase Canonical sheet (A1:D60) — columns: phase#, category, task, cost
 * Payment Schedule sheet (A1:F10) — columns: num, title, planned,
 *                                   cumulative, actual, dateCompleted
 */

import { google } from 'googleapis'
import { CANONICAL_EXPENSES } from './phase-categories.js'
import type { ADUData, ExpenseCategory, PaymentMilestone } from './types.js'

const READ_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const WRITE_SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

/** Convert '$1,234.56' / 'TBD' / 'Excluded' / empty to a float. */
const parseCurrency = (value: unknown): number => {
  if (typeof value !== 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  const cleaned = value.replace(/[$,]/g, '').trim()
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

const getSheetsClient = (opts: { write?: boolean } = {}) => {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not set')
  if (!credentialsJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set')

  const credentials = JSON.parse(credentialsJson)
  const scopes = opts.write ? WRITE_SCOPES : READ_SCOPES
  const auth = new google.auth.GoogleAuth({ credentials, scopes })
  return { sheets: google.sheets({ version: 'v4', auth }), sheetId }
}

/**
 * Mirrors server.py:add_expense_item write path exactly:
 *   1. Read existing rows in Phase Canonical to compute next-row index.
 *   2. Bail with `sheet_full` if next row would exceed 60.
 *   3. Update A{n}:D{n} with [phase, category, task, '$cost']. Uses
 *      USER_ENTERED so the sheet UI sees real currency values.
 *
 * Returns the row number written, or one of two failure modes:
 *   - 'sheet_full' (HTTP 507 equivalent)
 *   - { error: Error } for any Sheets API error (HTTP 502 equivalent)
 */
export type AppendExpenseRow =
  | { ok: true; row: number }
  | { ok: false; kind: 'sheet_full' }
  | { ok: false; kind: 'api_error'; error: Error }

export const appendExpenseRow = async (
  phase: number,
  category: string,
  task: string,
  cost: number,
): Promise<AppendExpenseRow> => {
  const { sheets, sheetId } = getSheetsClient({ write: true })

  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "'Phase Canonical'!A1:D60",
    })
    const nextRow = (existing.data.values?.length ?? 0) + 1
    if (nextRow > 60) return { ok: false, kind: 'sheet_full' }

    // Match Python's f'${cost:,.2f}' — comma thousands separator + 2 decimals.
    const costFormatted = `$${cost.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'Phase Canonical'!A${nextRow}:D${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[String(phase), category, task, costFormatted]] },
    })
    return { ok: true, row: nextRow }
  } catch (err) {
    return { ok: false, kind: 'api_error', error: err instanceof Error ? err : new Error(String(err)) }
  }
}

export const fetchFromSheets = async (): Promise<ADUData> => {
  const { sheets, sheetId } = getSheetsClient()

  // --- Phase Canonical ---
  const canonical = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "'Phase Canonical'!A1:D60",
  })
  const canonicalRows = (canonical.data.values ?? []).slice(1) // skip header

  type PhaseAcc = { category: string; items: { task: string; cost: number }[]; total: number }
  const phases = new Map<string, PhaseAcc>()

  for (const row of canonicalRows) {
    if (row.length < 3) continue
    const phaseNum = String(row[0] ?? '').trim()
    const category = String(row[1] ?? '').trim()
    const task = String(row[2] ?? '').trim()
    const cost = row.length > 3 ? parseCurrency(row[3]) : 0

    if (!phaseNum || !task) continue
    let phase = phases.get(phaseNum)
    if (!phase) {
      phase = { category, items: [], total: 0 }
      phases.set(phaseNum, phase)
    }
    phase.items.push({ task, cost })
    phase.total += cost
  }

  // Map preserves insertion order, which matches Python's phase_order list.
  const expenses: ExpenseCategory[] = Array.from(phases.values(), (p, i) => ({
    category: p.category,
    items: p.items,
    total: Math.round(p.total * 100) / 100,
    phase: i + 1,
  }))

  // --- Payment Schedule ---
  const payResult = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "'Payment Schedule'!A1:F10",
  })
  const payRows = (payResult.data.values ?? []).slice(1)

  const payments: PaymentMilestone[] = []
  for (const row of payRows) {
    if (row.length < 3) continue
    const numRaw = String(row[0] ?? '').trim()
    payments.push({
      num: /^\d+$/.test(numRaw) ? Number.parseInt(numRaw, 10) : 0,
      title: row.length > 1 ? String(row[1] ?? '') : '',
      planned: row.length > 2 ? parseCurrency(row[2]) : 0,
      cumulative: row.length > 3 ? parseCurrency(row[3]) : 0,
      actual: row.length > 4 ? parseCurrency(row[4]) : 0,
      dateCompleted: row.length > 5 ? String(row[5] ?? '').trim() : '',
    })
  }

  return {
    expenses,
    payments,
    lastUpdated: new Date().toISOString(),
    source: 'google_sheets',
  }
}

/**
 * Top-level data fetch — wraps fetchFromSheets with the canonical-fallback
 * path that server.py:fetch_adu_data implements. If the live sheet read
 * fails for any reason (auth, network, rate limit, sheet deleted, etc),
 * return the hardcoded CANONICAL_EXPENSES with no payments and a
 * 'canonical_fallback' source marker so the dashboard still renders.
 *
 * Skipped vs Python: the best-effort data.json write that happens on each
 * successful fetch. Python writes it but no endpoint reads it back — pure
 * dead persistence. The Dockerfile creates the file but nothing external
 * consumes it. Not worth porting.
 */
export const fetchADUData = async (): Promise<ADUData> => {
  try {
    return await fetchFromSheets()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Sheets fetch failed: ${message} — using canonical expenses + empty payments`)
    return {
      expenses: CANONICAL_EXPENSES,
      payments: [],
      lastUpdated: new Date().toISOString(),
      source: 'canonical_fallback',
    }
  }
}
