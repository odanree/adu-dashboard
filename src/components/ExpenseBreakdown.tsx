/**
 * ExpenseBreakdown component - displays expense categories and items
 * Supports two modes: expand (view details) and cumulative (select multiple to add up)
 */

import React, { useState } from 'react'
import { formatCurrency } from '@utils/formatters'
import type { ExpenseCategory } from '@types'
import Modal from './Modal'
import { CumulativeSummary } from './CumulativeSummary'

interface ExpenseBreakdownProps {
  categories: ExpenseCategory[]
  isSignedIn: boolean
  isWhitelisted?: boolean
  onModeChange?: (mode: 'expand' | 'cumulative') => void
  onSelectionChange?: (selected: Set<string>) => void
}

type ViewMode = 'expand' | 'cumulative'

interface TooltipPosition {
  top: number
  left: number
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({
  categories,
  isSignedIn,
  isWhitelisted = false,
  onModeChange,
  onSelectionChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('expand')
  const [selectedPhases, setSelectedPhases] = useState<Set<string>>(new Set())
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 })

  const handleCategoryClick = (category: ExpenseCategory) => {
    if (!isSignedIn) return

    if (viewMode === 'expand') {
      // Expand mode: open modal with details
      setSelectedCategory(category)
      setIsModalOpen(true)
    } else {
      // Cumulative mode: toggle selection
      const newSelected = new Set(selectedPhases)
      if (newSelected.has(category.category)) {
        newSelected.delete(category.category)
      } else {
        newSelected.add(category.category)
      }
      setSelectedPhases(newSelected)
      // Notify parent of selection change
      onSelectionChange?.(newSelected)
    }
  }

  const showTooltipAtElement = (tooltipId: string, event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    
    setTooltipPos({
      top: rect.top - 32, // 32px above the element for better hover effect
      left: rect.left + rect.width / 2, // Center horizontally
    })
    
    setActiveTooltip(tooltipId)
  }

  const handleSwitchMode = (mode: ViewMode) => {
    setViewMode(mode)
    setSelectedPhases(new Set()) // Reset selections when switching modes
    onModeChange?.(mode)
    onSelectionChange?.(new Set()) // Reset parent's selection
  }

  return (
    <div className="overflow-visible" data-testid="expense-breakdown">
      <h3 data-testid="expense-breakdown-title" className="text-lg font-bold mb-3 text-gray-900">💰 Expense Breakdown by Phase</h3>

      {/* Mode Toggle Buttons */}
      <div className="flex gap-2 mb-3 flex-col md:flex-row relative z-40">
        <div className="relative w-full md:w-auto group">
          <button
            onClick={(e) => {
              if (!isSignedIn) {
                showTooltipAtElement('expand', e)
              } else {
                handleSwitchMode('expand')
              }
            }}
            className={`w-full md:w-auto px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
              !isSignedIn ? 'opacity-50' : ''
            } ${
              viewMode === 'expand'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👁️ Expand Mode
          </button>
        </div>
        <div className="relative w-full md:w-auto group">
          <button
            onClick={(e) => {
              if (!isSignedIn) {
                showTooltipAtElement('cumulative', e)
              } else {
                handleSwitchMode('cumulative')
              }
            }}
            className={`w-full md:w-auto px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
              !isSignedIn ? 'opacity-50' : ''
            } ${
              viewMode === 'cumulative'
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ☑️ Cumulative Mode
          </button>
        </div>
      </div>

      {/* Cumulative Summary - displayed when in cumulative mode */}
      {viewMode === 'cumulative' && isSignedIn && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-lg p-5 mb-3">
          <CumulativeSummary
            total={Array.from(selectedPhases).reduce((sum: number, categoryName) => {
              const category = categories.find((c: any) => c.category === categoryName)
              return sum + (category?.total || 0)
            }, 0)}
            selectedCount={selectedPhases.size}
          />
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3 w-full relative z-30">
        {categories
          .sort((a, b) => a.phase - b.phase)
          .map((category) => (
            <div
              key={category.category}
              onClick={(e) => {
                if (!isSignedIn) {
                  showTooltipAtElement(category.category, e)
                } else {
                  handleCategoryClick(category)
                }
              }}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer text-sm flex flex-col relative ${
                !isSignedIn
                  ? 'opacity-50'
                  : viewMode === 'cumulative' && selectedPhases.has(category.category)
                  ? 'border-primary-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-primary-500 hover:shadow-md'
              }`}
            >
              {/* Tooltip on click when not signed in */}
              {activeTooltip === category.category && !isSignedIn && (
                <div className="fixed bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-50 shadow-lg pointer-events-none" style={{
                  top: `${tooltipPos.top}px`,
                  left: `${tooltipPos.left}px`,
                  transform: 'translateX(-50%)',
                  opacity: 1,
                }}>
                  Must be signed in to use
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900" style={{transform: 'translateX(-50%) rotate(45deg)'}}></div>
                </div>
              )}
              {/* Checkmark in cumulative mode */}
              {viewMode === 'cumulative' && (
                <div className="flex justify-between items-start mb-1">
                  <div className="text-base">
                    {selectedPhases.has(category.category) ? '✓' : ''}
                  </div>
                </div>
              )}
              <div className="font-semibold text-sm text-gray-900 mb-auto break-words">
                {category.category}
              </div>
              <div className="text-lg font-bold text-primary-500 break-words mt-2">
                {formatCurrency(category.total)}
              </div>
            </div>
          ))}
      </div>

      {/* Total or Cumulative Display */}
      {viewMode === 'expand' && isSignedIn ? (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-gray-600">Total Expenses</div>
          <div className="text-xl font-bold text-primary-500">
            {formatCurrency(categories.reduce((sum: number, cat: any) => sum + cat.total, 0))}
          </div>
        </div>
      ) : null}

      {/* Modal for category details (expand mode only) */}
      {selectedCategory && viewMode === 'expand' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCategory(null)
          }}
          title={selectedCategory.category}
          size="md"
        >
          <div className="space-y-0 h-full flex flex-col">
            {/* Items List */}
            <div className="divide-y divide-gray-200 flex-1">
              {selectedCategory.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-start py-2 px-1 hover:bg-indigo-50 transition-colors rounded"
                >
                  <span className="text-gray-700 flex-1">{item.task}</span>
                  <span className="font-semibold text-gray-900 ml-4 whitespace-nowrap">
                    {formatCurrency(item.cost)}
                  </span>
                </div>
              ))}
            </div>

            {/* Category Total */}
            <div className="pt-3 mt-2 border-t-2 border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Category Total</span>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(selectedCategory.total)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Tooltips rendered at root level to avoid opacity inheritance */}
      {activeTooltip && !isSignedIn && (
        <div
          className="fixed bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-50 shadow-lg pointer-events-none"
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            transform: 'translateX(-50%)',
            opacity: 1,
          }}
        >
          Must be signed in to use
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900"
            style={{ transform: 'translateX(-50%) rotate(45deg)' }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default ExpenseBreakdown
