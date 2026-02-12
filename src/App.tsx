/**
 * Main App component - orchestrates the dashboard layout
 */

import React, { useState } from 'react'
import useFetchADUData from '@hooks/useFetchADUData'
import useAuth from '@hooks/useAuth'
import { formatCurrency } from '@utils/formatters'
import { calculateProjectDuration } from '@utils/dates'
import { ProgressBar } from '@components/ProgressBar'
import { StatCard } from '@components/StatCard'
import { ExpenseBreakdown } from '@components/ExpenseBreakdown'
import Header from '@components/Header'
import SignOffSection from '@components/SignOffSection'
import SignOffStatus from '@components/SignOffStatus'
import TestSignIn from '@components/TestSignIn'
import type { ExpenseCategory } from '@types'
import './App.css'

const PROJECT_START_DATE = new Date('2025-10-08')

// Milestone data with dates
const MILESTONE_DATA = [
  { title: 'Initial Deposit & Site Mobilization', date: '10/08/2025', icon: '🏗️' },
  { title: 'Foundation & Under-Slab Inspection', date: '11/06/2025', icon: '✅' },
  { title: 'Rough MEP Inspection', date: 'TBD', icon: '🔧' },
  { title: 'Framing Inspection / Dry-In', date: 'TBD', icon: '🪵' },
  { title: 'Insulation & Drywall Inspections', date: 'TBD', icon: '🧱' },
  { title: 'Final Inspection & Project Completion', date: 'TBD', icon: '🎉' },
]

export const App: React.FC = () => {
  const { data, loading, error, refresh } = useFetchADUData()
  const { isSignedIn, email, isWhitelisted, signOut } = useAuth()
  const [showTestSignIn, setShowTestSignIn] = useState(false)
  const [, setExpenseViewMode] = useState<'expand' | 'cumulative'>('expand')
  const [, setSelectedPhases] = useState<Set<string>>(new Set())

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">{error || 'An error occurred'}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Filter expenses based on whitelist status - hide OHP from non-whitelisted users
  const visibleExpenses = isWhitelisted 
    ? data.expenses 
    : data.expenses.filter((e: ExpenseCategory) => e.category !== 'OHP (Overhead & Profit)')
  
  // Calculate metrics - whitelisted users see full budget, others see project cost only
  const totalBudget = isWhitelisted ? 225200 : 214076
  const paidExpenses = visibleExpenses.filter((e: ExpenseCategory) => e.phase === 1 || e.phase === 2)
  const totalSpent = paidExpenses.reduce((sum: number, e: ExpenseCategory) => sum + e.total, 0)
  const remaining = totalBudget - totalSpent
  const progress = Math.round((totalSpent / totalBudget) * 100)
  const projectDuration = calculateProjectDuration(PROJECT_START_DATE)

  // Create milestones for progress bar - use visible expense phases as milestones
  const milestones = visibleExpenses.map((expense: ExpenseCategory, idx: number) => {
    const cumulativePercent = visibleExpenses
      .slice(0, idx + 1)
      .reduce((sum: number, e: ExpenseCategory) => sum + e.total, 0) / totalBudget * 100
    
    return {
      name: MILESTONE_DATA[idx]?.title || expense.category,
      position: Math.min(cumulativePercent, 100), // Cumulative position capped at 100%
      date: MILESTONE_DATA[idx]?.date || 'TBD',
      icon: MILESTONE_DATA[idx]?.icon || '📍',
    }
  })

  return (
    <>
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <Header
        isSignedIn={isSignedIn}
        email={email}
        onSignOut={signOut}
        onTestSignInClick={() => setShowTestSignIn(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-3 py-4 max-w-6xl" data-testid="main-content">
        {/* Stats Grid - 2 columns on small, 4 on larger */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-1" data-testid="stats-grid">
          <StatCard
            label="Total Budget"
            value={formatCurrency(totalBudget)}
            icon="💵"
          />
          <StatCard
            label="Amount Spent"
            value={formatCurrency(totalSpent)}
            icon="💰"
          />
          <StatCard
            label="Remaining"
            value={formatCurrency(remaining)}
            icon="🏦"
          />
          <StatCard
            label="Progress"
            value={`${progress}%`}
            icon="📊"
          />
        </div>

        {/* Progress Section with Project Duration */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-1" data-testid="progress-section">
          {/* Project Duration paired with Progress */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-gray-600">Project Duration</div>
              <div data-testid="project-duration" className="text-lg font-bold text-primary-500">{projectDuration}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <ProgressBar progress={progress} milestones={milestones} />
        </div>

        {/* Contractor's Expense Sign-Off Card */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-1" data-testid="sign-off-section">
          <h3 className="text-lg font-bold mb-3 text-gray-900">🔐 Contractor&apos;s Expense Sign-Off</h3>
          {!isSignedIn ? (
            <p className="text-sm text-gray-600">Sign in to view expense sign-off progress</p>
          ) : (
            <>
              <SignOffStatus email={email || ''} />
              <SignOffSection email={email || ''} />
            </>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-1" data-testid="expense-section">
          <ExpenseBreakdown
            categories={visibleExpenses}
            isSignedIn={isSignedIn}
            onModeChange={setExpenseViewMode}
            onSelectionChange={setSelectedPhases}
          />
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={refresh}
            className="px-4 py-2 bg-white text-primary-500 font-semibold rounded-lg border-2 border-primary-500 hover:bg-primary-50 transition-colors text-sm"
          >
            🔄 Refresh Data
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black bg-opacity-50 text-white text-center py-2 mt-2">
        <p className="text-xs">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'privacy' }))}
            className="hover:underline mr-2 bg-none border-none cursor-pointer text-white"
          >
            Privacy Policy
          </button>
          •
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'terms' }))}
            className="hover:underline ml-2 bg-none border-none cursor-pointer text-white"
          >
            Terms of Service
          </button>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      </footer>
    </div>

    {showTestSignIn && (
      <TestSignIn
        onSignIn={() => {
          window.location.reload()
        }}
        onClose={() => setShowTestSignIn(false)}
      />
    )}
  </>
  )
}

export default App
