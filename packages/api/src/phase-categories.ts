/**
 * Phase → category name lookup for the POST /api/expenses handler.
 *
 * Mirrors the slice of server.py:CANONICAL_EXPENSES used in
 * add_expense_item — only the (phase, category) pairs matter when
 * appending a change-order row. The full canonical breakdown (items,
 * totals) stays in Python until the canonical_fallback path is ported
 * in Phase C4.
 *
 * If a phase isn't found, callers fall back to `Phase {N}` to match
 * Python's `next(..., f'Phase {phase_num}')`.
 */

export const PHASE_CATEGORIES: Record<number, string> = {
  1: 'Phase 1: Site Mobilization',
  2: 'Phase 2: Foundation',
  3: 'Phase 3: Rough MEP',
  4: 'Phase 4: Framing',
  5: 'Phase 5: Exterior',
  6: 'Phase 6: Final Completion',
  7: 'OHP (Overhead & Profit)',
}

export const categoryFor = (phase: number): string =>
  PHASE_CATEGORIES[phase] ?? `Phase ${phase}`
