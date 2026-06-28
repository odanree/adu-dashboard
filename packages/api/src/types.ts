/**
 * Wire types for /api/data. Must match the shapes in
 * packages/ui/src/types/index.ts so the UI is unaffected by which
 * backend is serving (Python server.py or this TS replacement).
 */

export interface ExpenseItem {
  task: string
  cost: number
}

export interface ExpenseCategory {
  category: string
  items: ExpenseItem[]
  total: number
  phase: number
}

export interface PaymentMilestone {
  num: number
  title: string
  planned: number
  cumulative: number
  actual: number
  dateCompleted: string
}

export interface ADUData {
  expenses: ExpenseCategory[]
  payments: PaymentMilestone[]
  lastUpdated: string
  source: 'google_sheets' | 'canonical_fallback'
}
