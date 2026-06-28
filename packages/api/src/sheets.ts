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
import type { ADUData, ExpenseCategory, PaymentMilestone } from './types.js'

const READ_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

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

const getSheetsClient = () => {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID not set')
  if (!credentialsJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set')

  const credentials = JSON.parse(credentialsJson)
  const auth = new google.auth.GoogleAuth({ credentials, scopes: READ_SCOPES })
  return { sheets: google.sheets({ version: 'v4', auth }), sheetId }
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
  const phaseOrder: string[] = []

  for (const row of canonicalRows) {
    if (row.length < 3) continue
    const phaseNum = String(row[0] ?? '').trim()
    const category = String(row[1] ?? '').trim()
    const task = String(row[2] ?? '').trim()
    const cost = row.length > 3 ? parseCurrency(row[3]) : 0

    if (!phaseNum || !task) continue
    if (!phases.has(phaseNum)) {
      phases.set(phaseNum, { category, items: [], total: 0 })
      phaseOrder.push(phaseNum)
    }
    const phase = phases.get(phaseNum)!
    phase.items.push({ task, cost })
    phase.total += cost
  }

  const expenses: ExpenseCategory[] = phaseOrder.map((ph, i) => {
    const p = phases.get(ph)!
    return {
      category: p.category,
      items: p.items,
      total: Math.round(p.total * 100) / 100,
      phase: i + 1,
    }
  })

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
