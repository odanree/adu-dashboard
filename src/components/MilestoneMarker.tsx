/**
 * MilestoneMarker component - displays a single milestone on the progress bar
 */

import React, { useState } from 'react'

interface MilestoneMarkerProps {
  position: number
  label: string
  date: string
  icon?: string
}

export const MilestoneMarker: React.FC<MilestoneMarkerProps> = ({
  position,
  label,
  date,
}) => {
  const [showLabel, setShowLabel] = useState(false)

  return (
    <div
      className="absolute top-0 transform -translate-x-1/2 group"
      style={{ left: `${position}%` }}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
    >
      {/* Tooltip - positioned above the dot */}
      <div
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap pointer-events-none transition-all duration-150 z-10 ${
          showLabel ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="font-semibold text-center">{label}</div>
        <div className="text-gray-300 text-center text-xs">{date}</div>
        {/* Arrow pointing down to dot */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" style={{ top: '100%', marginTop: '-4px' }} />
      </div>

      {/* Dot - sits on the progress bar track */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-md hover:scale-125 cursor-pointer transition-transform z-20 pointer-events-auto" />
    </div>
  )
}

export default MilestoneMarker
