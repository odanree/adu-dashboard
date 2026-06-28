/**
 * Whitelist check — mirrors server.py:is_whitelisted exactly.
 *
 * Source of truth is the VITE_WHITELISTED_EMAILS env var (legacy name —
 * predates the runtime-whitelist-check feature). Falls back to
 * WHITELISTED_EMAILS so either name in the prod env works.
 *
 * Comparison is case-insensitive and ignores surrounding whitespace.
 */

const SHEETS_URL =
  'https://docs.google.com/spreadsheets/d/1ZTX4H7qQPVZcU4TwoXcOVdbovHmRy3DZrcdfA3Qw2wk/edit?gid=361465694'

const getAllowedEmails = (): string[] => {
  const raw = process.env.VITE_WHITELISTED_EMAILS ?? process.env.WHITELISTED_EMAILS ?? ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export const isWhitelisted = (email: string): boolean =>
  getAllowedEmails().includes(email.trim().toLowerCase())

export interface SheetsLinkResponse {
  authorized: boolean
  url?: string
  message?: string
}

export const sheetsLinkResponse = (email: string): SheetsLinkResponse =>
  isWhitelisted(email)
    ? { authorized: true, url: SHEETS_URL }
    : {
        authorized: false,
        message: 'Access denied. Only authorized users can access the expense sheet.',
      }
