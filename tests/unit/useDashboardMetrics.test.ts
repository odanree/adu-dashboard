import { describe, expect, test } from 'vitest'
import type { Milestone } from '@/constants/milestones'
import {
  OHP_CATEGORY,
  TOTAL_BUDGET_PUBLIC,
  TOTAL_BUDGET_WHITELISTED,
  computeDashboardMetrics,
} from '@hooks/useDashboardMetrics'
import type { ADUData, ExpenseCategory } from '@types'

const category = (
  name: string,
  phase: number,
  total: number,
  items: { task: string; cost: number }[] = [],
): ExpenseCategory => ({ category: name, phase, total, items })

const SIX_PHASES: ExpenseCategory[] = [
  category('Phase 1: Site Mobilization', 1, 21800),
  category('Phase 2: Foundation', 2, 26000),
  category('Phase 3: Rough MEP', 3, 34100),
  category('Phase 4: Framing', 4, 28000),
  category('Phase 5: Exterior', 5, 56000),
  category('Phase 6: Final Completion', 6, 48176),
]

const FIRST_TWO_COMPLETE: readonly Milestone[] = [
  { title: 'P1', date: '10/08/2025', icon: '🏗️' },
  { title: 'P2', date: '11/06/2025', icon: '✅' },
  { title: 'P3', date: 'TBD', icon: '🔧' },
  { title: 'P4', date: 'TBD', icon: '🪵' },
  { title: 'P5', date: 'TBD', icon: '🧱' },
  { title: 'P6', date: 'TBD', icon: '🎉' },
]

const data = (overrides: Partial<ADUData> = {}): ADUData => ({
  expenses: SIX_PHASES,
  lastUpdated: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('computeDashboardMetrics', () => {
  test('returns null when data is null', () => {
    expect(computeDashboardMetrics(null, true)).toBeNull()
    expect(computeDashboardMetrics(undefined, false)).toBeNull()
  })

  describe('totalBudget', () => {
    test('whitelisted user sees full budget', () => {
      const metrics = computeDashboardMetrics(data(), true, FIRST_TWO_COMPLETE)
      expect(metrics?.totalBudget).toBe(TOTAL_BUDGET_WHITELISTED)
    })

    test('non-whitelisted user sees public budget', () => {
      const metrics = computeDashboardMetrics(data(), false, FIRST_TWO_COMPLETE)
      expect(metrics?.totalBudget).toBe(TOTAL_BUDGET_PUBLIC)
    })
  })

  describe('visibleExpenses', () => {
    test('whitelisted: keeps OHP category', () => {
      const withOhp = data({
        expenses: [...SIX_PHASES, category(OHP_CATEGORY, 7, 11124)],
      })
      const metrics = computeDashboardMetrics(withOhp, true, FIRST_TWO_COMPLETE)
      expect(metrics?.visibleExpenses).toHaveLength(7)
      expect(metrics?.visibleExpenses.some((e) => e.category === OHP_CATEGORY)).toBe(true)
    })

    test('non-whitelisted: filters OHP category out', () => {
      const withOhp = data({
        expenses: [...SIX_PHASES, category(OHP_CATEGORY, 7, 11124)],
      })
      const metrics = computeDashboardMetrics(withOhp, false, FIRST_TWO_COMPLETE)
      expect(metrics?.visibleExpenses).toHaveLength(6)
      expect(metrics?.visibleExpenses.some((e) => e.category === OHP_CATEGORY)).toBe(false)
    })
  })

  describe('totalSpent', () => {
    test('uses Payment Schedule totalPaid when payments present', () => {
      const withPayments = data({
        payments: [
          {
            num: 1,
            title: 'Initial',
            planned: 25000,
            cumulative: 25000,
            actual: 25000,
            dateCompleted: '2025-10-08',
          },
          {
            num: 2,
            title: 'Foundation',
            planned: 30000,
            cumulative: 55000,
            actual: 30000,
            dateCompleted: '2025-11-06',
          },
        ],
      })
      const metrics = computeDashboardMetrics(withPayments, true, FIRST_TWO_COMPLETE)
      // computePaymentTotals adds completed milestone actuals
      expect(metrics?.totalSpent).toBe(55000)
    })

    test('falls back to sum of phases 1-5 when no payments', () => {
      const metrics = computeDashboardMetrics(data(), true, FIRST_TWO_COMPLETE)
      // Phases 1-5: 21800 + 26000 + 34100 + 28000 + 56000 = 165900
      expect(metrics?.totalSpent).toBe(165900)
    })

    test('falls back to sum of phases 1-5 when payments array is empty', () => {
      const metrics = computeDashboardMetrics(data({ payments: [] }), true, FIRST_TWO_COMPLETE)
      expect(metrics?.totalSpent).toBe(165900)
    })
  })

  describe('remaining', () => {
    test('equals totalBudget minus totalSpent', () => {
      const metrics = computeDashboardMetrics(data(), true, FIRST_TWO_COMPLETE)
      expect(metrics?.remaining).toBe(TOTAL_BUDGET_WHITELISTED - 165900)
    })
  })

  describe('progress', () => {
    test('budget-weighted by completed milestones', () => {
      // First two phases complete, six phases total construction.
      // completed: 21800 + 26000 = 47800
      // total: 21800 + 26000 + 34100 + 28000 + 56000 + 48176 = 214076
      // progress = round(47800 / 214076 * 100) = round(22.33%) = 22
      const metrics = computeDashboardMetrics(data(), true, FIRST_TWO_COMPLETE)
      expect(metrics?.progress).toBe(22)
    })

    test('excludes OHP from both numerator and denominator', () => {
      const ohpHeavy = data({
        expenses: [...SIX_PHASES, category(OHP_CATEGORY, 7, 100000)],
      })
      const metricsWith = computeDashboardMetrics(ohpHeavy, true, FIRST_TWO_COMPLETE)
      const metricsWithout = computeDashboardMetrics(data(), true, FIRST_TWO_COMPLETE)
      // OHP appended at the end → not in completed range, but is in total.
      // If OHP weren't excluded, the denominator would jump and progress would drop.
      // With OHP excluded from both sides, progress stays identical.
      expect(metricsWith?.progress).toBe(metricsWithout?.progress)
    })

    test('returns 0 when constructionTotal is 0', () => {
      const empty = data({ expenses: [] })
      const metrics = computeDashboardMetrics(empty, true, FIRST_TWO_COMPLETE)
      expect(metrics?.progress).toBe(0)
    })

    test('returns 100 when all milestones are complete dates', () => {
      const allComplete = FIRST_TWO_COMPLETE.map((m) => ({ ...m, date: '01/01/2026' }))
      const metrics = computeDashboardMetrics(data(), true, allComplete)
      expect(metrics?.progress).toBe(100)
    })
  })

  describe('milestones', () => {
    test('one marker per visible expense', () => {
      const metrics = computeDashboardMetrics(data(), true, FIRST_TWO_COMPLETE)
      expect(metrics?.milestones).toHaveLength(6)
    })

    test('positions are monotonically non-decreasing', () => {
      const metrics = computeDashboardMetrics(data(), true, FIRST_TWO_COMPLETE)
      const positions = metrics?.milestones.map((m) => m.position) ?? []
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThanOrEqual(positions[i - 1]!)
      }
    })

    test('position capped at 100', () => {
      const metrics = computeDashboardMetrics(data(), false, FIRST_TWO_COMPLETE)
      const max = Math.max(...(metrics?.milestones.map((m) => m.position) ?? [0]))
      expect(max).toBeLessThanOrEqual(100)
    })

    test('falls back to expense category name when milestone title missing', () => {
      const shortMilestones: readonly Milestone[] = [FIRST_TWO_COMPLETE[0]!] // only 1 milestone for 6 expenses
      const metrics = computeDashboardMetrics(data(), true, shortMilestones)
      expect(metrics?.milestones[0]?.name).toBe('P1')
      expect(metrics?.milestones[1]?.name).toBe('Phase 2: Foundation')
    })
  })
})
