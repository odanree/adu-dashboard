import type { PaymentMilestone } from '@types'

// See memory: project_adu_payment_schedule_schema.
// Column E ("Actual") is cumulative-actual for milestone rows (num > 0) and
// per-payment-actual for ad-hoc rows (num = 0). Naive sum over-counts.
export const computePaymentTotals = (payments: PaymentMilestone[]) => {
  const completedMilestones = payments.filter(p => p.num > 0 && p.dateCompleted.trim() !== '')
  const adHoc = payments.filter(p => p.num === 0 && p.actual > 0)

  const milestonePaid = completedMilestones.reduce((max, p) => Math.max(max, p.actual), 0)
  const adHocPaid = adHoc.reduce((sum, p) => sum + p.actual, 0)
  const totalPaid = milestonePaid + adHocPaid

  const totalPlanned = payments
    .filter(p => p.num > 0)
    .reduce((max, p) => Math.max(max, p.cumulative), 0)

  const percent = totalPlanned > 0 ? (totalPaid / totalPlanned) * 100 : 0

  return { totalPaid, totalPlanned, percent }
}
