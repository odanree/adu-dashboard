/**
 * Admin Dashboard - Manage fallback data
 */

import React, { useState, useEffect } from 'react'
import { formatCurrency } from '@utils/formatters'
import '../styles/Admin.css'

interface ExpenseItem {
  task: string
  cost: number
}

interface ExpenseCategory {
  category: string
  items: ExpenseItem[]
  total: number
  phase: number
}

interface AdminData {
  expenses: ExpenseCategory[]
}

export const Admin: React.FC = () => {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPhase, setEditingPhase] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8888/api/data')
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const updatePhaseTotal = (phaseIndex: number) => {
    if (!data) return
    const phase = data.expenses[phaseIndex]
    const newTotal = phase.items.reduce((sum, item) => sum + item.cost, 0)
    const updatedData = { ...data }
    updatedData.expenses[phaseIndex].total = newTotal
    setData(updatedData)
  }

  const addItemToPhase = (phaseIndex: number) => {
    if (!data) return
    const updatedData = { ...data }
    updatedData.expenses[phaseIndex].items.push({ task: 'New Item', cost: 0 })
    setData(updatedData)
  }

  const removeItemFromPhase = (phaseIndex: number, itemIndex: number) => {
    if (!data) return
    const updatedData = { ...data }
    updatedData.expenses[phaseIndex].items.splice(itemIndex, 1)
    updatePhaseTotal(phaseIndex)
    setData(updatedData)
  }

  const updateItem = (phaseIndex: number, itemIndex: number, field: 'task' | 'cost', value: string | number) => {
    if (!data) return
    const updatedData = { ...data }
    const item = updatedData.expenses[phaseIndex].items[itemIndex]
    
    if (field === 'task') {
      item.task = value as string
    } else {
      item.cost = Math.max(0, Number(value) || 0)
    }
    
    setData(updatedData)
  }

  const saveData = async () => {
    try {
      setSaved(false)
      const response = await fetch('http://localhost:8888/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data')
    }
  }

  const totalBudget = data?.expenses.reduce((sum, phase) => sum + phase.total, 0) || 0

  if (loading) return <div className="admin-loading">Loading...</div>
  if (error) return <div className="admin-error">Error: {error}</div>
  if (!data) return <div className="admin-error">No data</div>

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>📊 ADU Dashboard Data Manager</h1>
        <div className="admin-stats">
          <div className="stat-item">
            <span className="stat-label">Total Budget:</span>
            <span className="stat-value">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Phases:</span>
            <span className="stat-value">{data.expenses.length}</span>
          </div>
        </div>
      </div>

      <div className="admin-controls">
        <button onClick={saveData} className="btn btn-primary">
          💾 Save All Changes
        </button>
        <button onClick={fetchData} className="btn btn-secondary">
          🔄 Reload Data
        </button>
        {saved && <div className="save-success">✓ Saved successfully!</div>}
      </div>

      <div className="phases-container">
        {data.expenses.map((phase, phaseIndex) => (
          <div
            key={phase.phase}
            className={`phase-card ${editingPhase === phaseIndex ? 'editing' : ''}`}
            onClick={() => setEditingPhase(editingPhase === phaseIndex ? null : phaseIndex)}
          >
            <div className="phase-header">
              <h2>
                {phase.category}
                <span className="phase-total">{formatCurrency(phase.total)}</span>
              </h2>
              <button
                className="phase-toggle"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingPhase(editingPhase === phaseIndex ? null : phaseIndex)
                }}
              >
                {editingPhase === phaseIndex ? '▼' : '▶'}
              </button>
            </div>

            {editingPhase === phaseIndex && (
              <div className="phase-content" onClick={(e) => e.stopPropagation()}>
                <div className="items-list">
                  {phase.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="item-row">
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => updateItem(phaseIndex, itemIndex, 'task', e.target.value)}
                        placeholder="Item name"
                        className="item-task"
                      />
                      <div className="item-cost-wrapper">
                        <span className="currency">$</span>
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => {
                            updateItem(phaseIndex, itemIndex, 'cost', e.target.value)
                            updatePhaseTotal(phaseIndex)
                          }}
                          placeholder="0"
                          className="item-cost"
                          min="0"
                        />
                      </div>
                      <button
                        onClick={() => removeItemFromPhase(phaseIndex, itemIndex)}
                        className="btn-remove"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addItemToPhase(phaseIndex)}
                  className="btn btn-add-item"
                >
                  + Add Item
                </button>

                <div className="phase-total-display">
                  <strong>Phase Total: {formatCurrency(phase.total)}</strong>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="admin-footer">
        <button onClick={saveData} className="btn btn-primary btn-large">
          💾 Save All Changes
        </button>
      </div>
    </div>
  )
}

export default Admin
