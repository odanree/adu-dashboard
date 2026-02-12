/**
 * StatCard component - displays a single statistic
 */

import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: string
  highlight?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  highlight = false,
}) => {
  return (
    <div
      className={`p-3 rounded-lg transition-all hover:shadow-md text-center ${
        highlight
          ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg'
          : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
      }`}
    >
      {icon && <div className={`text-lg mb-0.5 ${highlight ? '' : 'opacity-70'}`}>{icon}</div>}
      <div className={`text-xs font-medium ${highlight ? 'text-blue-100' : 'text-gray-600'}`}>
        {label}
      </div>
      <div className={`text-base font-bold my-0.5 ${highlight ? 'text-white' : 'text-primary-500'}`}>
        {value}
      </div>
      {subtext && (
        <div className={`text-xs ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
          {subtext}
        </div>
      )}
    </div>
  )
}

export default StatCard
