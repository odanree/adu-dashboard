/**
 * Derived dashboard metrics from ADUData + auth context.
 *
 * The pure computation lives in `computeDashboardMetrics` so it can be
 * unit-tested without React. The hook is a thin useMemo wrapper.
 *
 * Field meanings:
 *   visibleExpenses    Expenses minus OHP for non-whitelisted users.
 *   totalBudget        Sum of visibleExpenses — naturally includes OHP for
 *                      whitelisted users and excludes it for public users.
 *   totalSpent         Real money paid (from the Payment Schedule when
 *                      available). Falls back to "sum of phases 1-5
 *                      budgeted" when no payment data is present.
 *   remaining          totalBudget - totalSpent.
 *   progress           Construction completion %, budget-weighted. A phase
 *                      counts as complete when MILESTONE_DATA[idx].date is
 *                      a real date (not 'TBD'). OHP is excluded from both
 *                      sides. Independent of payments.
 *   milestones         Progress-bar markers (one per visible expense),
 *                      positioned by cumulative budget %.
 */

import { useMemo } from 'react'
import { MILESTONE_DATA, type Milestone } from '@/constants/milestones'
import { computePaymentTotals } from '@utils/payments'
import type { ADUData, ExpenseCategory } from '@types'

export const OHP_CATEGORY = 'OHP (Overhead & Profit)'

interface MilestoneMarker {
  name: string
  position: number
  date: string
  icon: string
}

export interface DashboardMetrics {
  visibleExpenses: ExpenseCategory[]
  totalBudget: number
  totalSpent: number
  remaining: number
  progress: number
  milestones: MilestoneMarker[]
}

export const computeDashboardMetrics = (
  data: ADUData | null | undefined,
  isWhitelisted: boolean,
  milestoneData: readonly Milestone[] = MILESTONE_DATA,
): DashboardMetrics | null => {
  if (!data) return null

  const expenses = data.expenses ?? []
  const visibleExpenses = isWhitelisted
    ? expenses
    : expenses.filter((e) => e.category !== OHP_CATEGORY)

  // Budget = sum of currently-visible expenses. For whitelisted users that's
  // the full sheet (incl. OHP); for public users, OHP is already filtered out
  // of visibleExpenses above. Deriving from the data eliminates the drift
  // class where hardcoded budget constants and the live sheet could diverge.
  const totalBudget = visibleExpenses.reduce((sum, e) => sum + e.total, 0)

  const paymentTotals =
    data.payments && data.payments.length > 0 ? computePaymentTotals(data.payments) : null
  const totalSpent = paymentTotals
    ? paymentTotals.totalPaid
    : visibleExpenses
        .filter((e) => e.phase >= 1 && e.phase <= 5)
        .reduce((sum, e) => sum + e.total, 0)
  const remaining = totalBudget - totalSpent

  const constructionExpenses = visibleExpenses.filter((e) => e.category !== OHP_CATEGORY)
  const constructionTotal = constructionExpenses.reduce((sum, e) => sum + e.total, 0)
  const completedConstruction = constructionExpenses.reduce((sum, e, idx) => {
    const date = milestoneData[idx]?.date
    return date && date !== 'TBD' ? sum + e.total : sum
  }, 0)
  const progress =
    constructionTotal > 0 ? Math.round((completedConstruction / constructionTotal) * 100) : 0

  const milestones: MilestoneMarker[] = visibleExpenses.map((expense, idx) => {
    const cumulativePercent =
      (visibleExpenses.slice(0, idx + 1).reduce((sum, e) => sum + e.total, 0) / totalBudget) * 100
    return {
      name: milestoneData[idx]?.title ?? expense.category,
      position: Math.min(cumulativePercent, 100),
      date: milestoneData[idx]?.date ?? 'TBD',
      icon: milestoneData[idx]?.icon ?? '📍',
    }
  })

  return { visibleExpenses, totalBudget, totalSpent, remaining, progress, milestones }
}

export const useDashboardMetrics = (
  data: ADUData | null | undefined,
  isWhitelisted: boolean,
): DashboardMetrics | null =>
  useMemo(() => computeDashboardMetrics(data, isWhitelisted), [data, isWhitelisted])

export default useDashboardMetrics
