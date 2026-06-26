/**
 * Admin Dashboard - Add change orders (line items) to phases.
 *
 * Edits flow through to the Google Sheet's Phase Canonical tab via the backend
 * POST /api/expenses endpoint. The Sheet remains the single source of truth;
 * the dashboard re-renders from a fresh fetch after each successful add.
 *
 * Existing line items are read-only here — to correct an existing item, edit
 * the Phase Canonical sheet directly.
 */

import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useAuth from '@hooks/useAuth'
import { aduDataQueryKey } from '@hooks/useFetchADUData'
import dataService from '@services/data'
import { formatCurrency } from '@utils/formatters'
import type { ADUData, ExpenseCategory } from '@types'

export const Admin: React.FC = () => {
  const { email, isWhitelisted } = useAuth()
  const queryClient = useQueryClient()
  const [phase, setPhase] = useState<number>(6)
  const [task, setTask] = useState('')
  const [cost, setCost] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const query = useQuery({
    queryKey: aduDataQueryKey,
    queryFn: () => dataService.fetchADUData(),
  })
  const data = query.data ?? null
  const loading = query.isLoading
  const error = query.error instanceof Error ? query.error.message : null

  const addChangeOrder = useMutation({
    mutationFn: (input: { email: string; phase: number; task: string; cost: number }) =>
      dataService.addChangeOrder(input),
    onSuccess: (result, variables) => {
      if (result.success) {
        showToast('success', `Added "${variables.task}" to Phase ${variables.phase}`)
        setTask('')
        setCost('')
        if (result.data) queryClient.setQueryData<ADUData>(aduDataQueryKey, result.data)
      } else {
        showToast('error', result.error || 'Failed to add change order')
      }
    },
  })

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      showToast('error', 'You must be signed in')
      return
    }
    const trimmedTask = task.trim()
    const parsedCost = Number(cost)
    if (!trimmedTask) {
      showToast('error', 'Description is required')
      return
    }
    if (!Number.isFinite(parsedCost) || parsedCost < 0) {
      showToast('error', 'Cost must be a non-negative number')
      return
    }
    addChangeOrder.mutate({ email, phase, task: trimmedTask, cost: parsedCost })
  }

  const submitting = addChangeOrder.isPending

  if (!isWhitelisted) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Not authorized</h2>
          <p className="text-gray-600">Sign in with a whitelisted account to manage change orders.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Could not load data'}</p>
          <button
            onClick={() => query.refetch()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const phaseOptions = data.expenses.map((e: ExpenseCategory) => ({
    value: e.phase,
    label: e.category,
  }))
  const grandTotal = data.expenses.reduce((sum, e) => sum + e.total, 0)

  return (
    <div className="min-h-screen bg-gradient-primary">
      <main className="container mx-auto px-3 py-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-3">
          <h1 className="text-2xl font-bold mb-1">📋 Change Orders</h1>
          <p className="text-sm text-gray-600">
            Add a new line item to any phase. Each entry is appended as a row to the
            Phase Canonical sheet — the dashboard picks it up on the next refresh.
          </p>
          <div className="text-xs text-gray-500 mt-2">
            Current total: <strong>{formatCurrency(grandTotal)}</strong> across {data.expenses.length} phases
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-4 mb-3 space-y-3"
        >
          <h2 className="text-lg font-bold">Add a change order</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phase</label>
            <select
              value={phase}
              onChange={(e) => setPhase(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={submitting}
            >
              {phaseOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder='e.g. "Upgrade kitchen faucet" or "Change order: extra outlet"'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={submitting}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cost (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !task.trim() || cost === ''}
            className="w-full bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding…' : '+ Add Change Order'}
          </button>

          {toast && (
            <div
              className={`text-sm p-2 rounded-lg ${
                toast.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {toast.message}
            </div>
          )}
        </form>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Current line items (read-only)</h2>
            <button
              onClick={() => query.refetch()}
              className="text-sm text-primary-500 hover:underline"
              disabled={query.isFetching}
            >
              🔄 Refresh
            </button>
          </div>
          <div className="space-y-4">
            {data.expenses.map((cat) => (
              <div key={cat.phase} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-gray-900">{cat.category}</h3>
                  <span className="text-sm font-bold text-primary-600">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
                <ul className="text-sm">
                  {cat.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between py-1 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-gray-700">{item.task}</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(item.cost)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))}
            className="px-4 py-2 bg-white text-primary-500 font-semibold rounded-lg border-2 border-primary-500 hover:bg-primary-50 transition-colors text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}

export default Admin
