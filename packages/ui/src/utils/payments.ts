import type { PaymentMilestone } from '@types'

// See memory: project_adu_payment_schedule_schema.
//
// A "completed" milestone (num > 0 with a dateCompleted) counts as paid in full
// at its *planned* cumulative amount — not its column-E actual. The actual
// column on milestone rows often lags the plan because some line items (e.g.
// architect/engineering) are billed to the homeowner directly, not through the
// contractor; that delta carries forward as a constant offset and is not money
// owed. Ad-hoc partial rows (num = 0) DO use their column-E value because that
// IS the actual payment for that row.
export const computePaymentTotals = (payments: PaymentMilestone[]) => {
  const completedMilestones = payments.filter(p => p.num > 0 && p.dateCompleted.trim() !== '')
  const adHoc = payments.filter(p => p.num === 0 && p.actual > 0)

  const milestonePaid = completedMilestones.length > 0
    ? completedMilestones[completedMilestones.length - 1].cumulative
    : 0
  const adHocPaid = adHoc.reduce((sum, p) => sum + p.actual, 0)
  const totalPaid = milestonePaid + adHocPaid

  const totalPlanned = payments
    .filter(p => p.num > 0)
    .reduce((max, p) => Math.max(max, p.cumulative), 0)

  const percent = totalPlanned > 0 ? (totalPaid / totalPlanned) * 100 : 0

  return { totalPaid, totalPlanned, percent }
}
