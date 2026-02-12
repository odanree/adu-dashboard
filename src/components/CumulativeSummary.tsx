/**
 * CumulativeSummary component - displays cumulative total as phases are selected
 */

import React from 'react'
import { formatCurrency } from '@utils/formatters'

interface CumulativeSummaryProps {
  total: number
  selectedCount: number
}

export const CumulativeSummary: React.FC<CumulativeSummaryProps> = ({
  total,
  selectedCount,
}) => {
  if (selectedCount === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <div className="text-gray-500 text-xs font-medium">Click phases to build cumulative total</div>
      </div>
    )
  }

  return (
    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-400 shadow-lg animate-slideDown">
      <div className="text-center">
        <div className="text-xs font-medium text-gray-600 mb-1">
          📊 Cumulative Total ({selectedCount} phase{selectedCount !== 1 ? 's' : ''})
        </div>
        <div className="text-2xl font-bold text-green-600">
          {formatCurrency(total)}
        </div>
      </div>
    </div>
  )
}

export default CumulativeSummary
