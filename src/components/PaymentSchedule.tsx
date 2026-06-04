import React, { useState } from 'react'
import { formatCurrency } from '@utils/formatters'
import type { PaymentMilestone } from '@types'

interface PaymentScheduleProps {
  payments: PaymentMilestone[]
}

// Column E ("Actual") on the source sheet is *cumulative-actual-paid* for numbered
// milestone rows, and *per-payment-actual* for ad-hoc rows (num=0). Total paid is
// therefore: the highest cumulative actual from completed milestones, plus any
// ad-hoc partial payments.
const computeTotals = (payments: PaymentMilestone[]) => {
  const completedMilestones = payments.filter(p => p.num > 0 && p.dateCompleted.trim() !== '')
  const adHoc = payments.filter(p => p.num === 0 && p.actual > 0)

  const milestonePaid = completedMilestones.reduce(
    (max, p) => Math.max(max, p.actual),
    0
  )
  const adHocPaid = adHoc.reduce((sum, p) => sum + p.actual, 0)
  const totalPaid = milestonePaid + adHocPaid

  const totalPlanned = payments
    .filter(p => p.num > 0)
    .reduce((max, p) => Math.max(max, p.cumulative), 0)

  const percent = totalPlanned > 0 ? (totalPaid / totalPlanned) * 100 : 0

  return { totalPaid, totalPlanned, percent }
}

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ payments }) => {
  const [expanded, setExpanded] = useState(false)

  if (!payments || payments.length === 0) return null

  const { totalPaid, totalPlanned, percent } = computeTotals(payments)
  const remaining = Math.max(totalPlanned - totalPaid, 0)
  const visibleRows = payments.filter(p => p.num > 0 || p.actual > 0)

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 mb-1" data-testid="payment-schedule-section">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">💳 Payment Schedule</h3>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-sm text-primary-500 hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">
            <strong>{formatCurrency(totalPaid)}</strong> paid of {formatCurrency(totalPlanned)}
          </span>
          <span className="text-gray-700 font-semibold">{percent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Remaining: {formatCurrency(remaining)}
        </div>
      </div>

      {expanded && (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 font-semibold text-gray-700">#</th>
                <th className="text-left p-2 font-semibold text-gray-700">Milestone</th>
                <th className="text-right p-2 font-semibold text-gray-700">Due</th>
                <th className="text-right p-2 font-semibold text-gray-700">Actual</th>
                <th className="text-left p-2 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((p, i) => {
                const isAdHoc = p.num === 0
                return (
                  <tr
                    key={i}
                    className={`border-t border-gray-100 ${isAdHoc ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-2 text-gray-700">{isAdHoc ? '—' : p.num}</td>
                    <td className="p-2 text-gray-900">{p.title || '(unlabeled)'}</td>
                    <td className="p-2 text-right text-gray-700">
                      {p.planned > 0 ? formatCurrency(p.planned) : '—'}
                    </td>
                    <td className="p-2 text-right text-gray-900 font-semibold">
                      {p.actual > 0 ? formatCurrency(p.actual) : '—'}
                    </td>
                    <td className="p-2 text-gray-600">{p.dateCompleted || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PaymentSchedule
