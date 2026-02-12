/**
 * ProgressBar component - displays project progress with milestone markers
 */

import React, { useState, useEffect } from 'react'

interface Milestone {
  name: string
  position: number
  date?: string
  icon?: string
}

interface ProgressBarProps {
  progress: number
  milestones?: Milestone[]
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  milestones = [],
}) => {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [displayPercent, setDisplayPercent] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Trigger animation on component mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Trigger animation with a small delay
      const timer = requestAnimationFrame(() => {
        setDisplayProgress(progress)
      })
      return () => cancelAnimationFrame(timer)
    }
  }, [progress, mounted])

  // Animate the percentage counter
  useEffect(() => {
    if (!mounted) return

    let animationFrame: number
    let currentPercent = 0
    const targetPercent = progress

    const animate = () => {
      if (currentPercent < targetPercent) {
        currentPercent += (targetPercent - currentPercent) * 0.1
        if (currentPercent > targetPercent - 0.5) {
          currentPercent = targetPercent
        }
        setDisplayPercent(Math.round(currentPercent))
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [progress, mounted])

  return (
    <div className="w-full" data-testid="progress-bar-container">
      {/* Progress label */}
      <div className="mb-1 text-center text-xs font-medium text-gray-600">
        Project Progress: <span className="text-primary-600 font-bold">{displayPercent}%</span>
      </div>

      {/* Progress bar with milestones container - compact */}
      <div className="relative w-full" style={{ height: '35px', zIndex: 1, overflow: 'visible' }}>
        {/* Milestone markers - positioned absolutely with tooltips */}
        {milestones.map((milestone, idx) => {
          // For the last 3 milestones (near right edge), align tooltip to the right
          const isNearRight = milestone.position > 70
          return (
          <div
            key={idx}
            className="absolute group"
            style={{ 
              left: `${milestone.position}%`,
              top: '16px',
              transform: 'translateX(-50%)',
              zIndex: 30
            }}
          >
            {/* Tooltip on hover - shows above dot */}
            <div 
              className={`absolute px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-40 ${
                isNearRight ? 'right-0 md:right-0' : 'left-0 md:left-1/2'
              } ${isNearRight ? '' : 'md:transform md:-translate-x-1/2'}`}
              style={{ bottom: '100%', marginBottom: '8px' }}
            >
              <div className="font-semibold text-center">{milestone.icon} {milestone.name}</div>
              <div className="text-gray-300 text-center text-xs mt-0.5">{milestone.date}</div>
              {/* Arrow pointing down */}
              <div 
                className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
                  isNearRight ? 'right-2 md:right-2' : 'left-2 md:left-1/2 md:-translate-x-1/2'
                }`}
                style={{ top: '100%', marginTop: '-4px' }}
              />
            </div>
            
            {/* Milestone dot - centered on progress bar */}
            <div className="w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-md hover:scale-125 transition-transform cursor-pointer hover:shadow-lg relative z-50" />
          </div>
        )
        })}

        {/* Progress bar - sits below dots, perfectly aligned */}
        <div className="absolute left-0 w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-sm" style={{ top: '22px', zIndex: 10 }}>
          {/* Progress fill with gradient - smooth animation */}
          <div
            className="h-full rounded-full shadow-md transition-all duration-1500 ease-out"
            style={{ 
              width: `${displayProgress}%`,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
