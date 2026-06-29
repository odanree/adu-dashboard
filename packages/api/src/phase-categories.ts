/**
 * Canonical phase data — used by:
 *   - POST /api/expenses: phase → category lookup for the row write
 *   - fetchADUData fallback: served as-is when Google Sheets is down
 *
 * Mirrors server.py:CANONICAL_EXPENSES exactly (totals, items, costs).
 * If the contractor's contract breakdown changes, update here AND in
 * server.py until the Python backend is retired in Phase D.
 */

import type { ExpenseCategory } from './types.js'

export const CANONICAL_EXPENSES: ExpenseCategory[] = [
  {
    category: 'Phase 1: Site Mobilization',
    items: [
      { task: 'Architect and Engineering', cost: 8000 },
      { task: 'Porta Potty', cost: 2100 },
      { task: 'Trash Fee', cost: 2600 },
      { task: 'Demo', cost: 4500 },
      { task: 'Clearing and Grubbing', cost: 2100 },
      { task: 'Excavation and Grading', cost: 2500 },
    ],
    total: 21800,
    phase: 1,
  },
  {
    category: 'Phase 2: Foundation',
    items: [{ task: 'Footings', cost: 26000 }],
    total: 26000,
    phase: 2,
  },
  {
    category: 'Phase 3: Rough MEP',
    items: [
      { task: 'Plumbing, gas, and electrical', cost: 9500 },
      { task: 'HVAC & Mechanical', cost: 7400 },
      { task: 'Electrical', cost: 12000 },
      { task: 'Plumbing', cost: 5200 },
    ],
    total: 34100,
    phase: 3,
  },
  {
    category: 'Phase 4: Framing',
    items: [{ task: 'Framing', cost: 28000 }],
    total: 28000,
    phase: 4,
  },
  {
    category: 'Phase 5: Exterior',
    items: [
      { task: 'Roofing', cost: 17000 },
      { task: 'Doors and Windows', cost: 11500 },
      { task: 'Exterior Stucco', cost: 12000 },
      { task: 'Insulation', cost: 4000 },
      { task: 'Drywall', cost: 11500 },
    ],
    total: 56000,
    phase: 5,
  },
  {
    category: 'Phase 6: Final Completion',
    items: [
      { task: 'Interior Painting', cost: 4400 },
      { task: 'Flooring', cost: 6576 },
      { task: 'ADU Kitchen', cost: 5500 },
      { task: 'ADU Bathroom 1', cost: 9500 },
      { task: 'Powder Room', cost: 5800 },
      { task: 'Lighting', cost: 4500 },
      { task: 'Baseboards', cost: 2700 },
      { task: 'Door Trim', cost: 2600 },
      { task: 'Exterior Stairs', cost: 3000 },
      { task: 'Paving', cost: 2500 },
      { task: 'Deputy Inspection', cost: 1500 },
    ],
    total: 48176,
    phase: 6,
  },
  {
    category: 'OHP (Overhead & Profit)',
    items: [
      { task: 'General Contractor Overhead', cost: 6000 },
      { task: 'General Contractor Profit', cost: 5124 },
    ],
    total: 11124,
    phase: 7,
  },
]

export const categoryFor = (phase: number): string =>
  CANONICAL_EXPENSES.find((e) => e.phase === phase)?.category ?? `Phase ${phase}`
