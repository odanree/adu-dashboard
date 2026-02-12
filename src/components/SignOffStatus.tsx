/**
 * SignOffStatus component - displays contractor expense sign-off tracking
 */

import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@utils/formatters'
import apiClient from '@services/api'

interface SignOffData {
  signedOffCount: number
  totalCount: number
  percentComplete: number
  signedOffAmount: string | number
  totalAmount: string | number
  pendingAmount: string | number
  pendingCount: number
}

interface SignOffStatusProps {
  email: string
}

export const SignOffStatus: React.FC<SignOffStatusProps> = () => {
  const [data, setData] = useState<SignOffData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSignOffStatus = async () => {
      try {
        const response = await apiClient.get('/api/expenses-signoff')
        const result = response.data
        if (result.success && result.signOff) {
          setData(result.signOff)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load sign-off status')
      } finally {
        setLoading(false)
      }
    }

    loadSignOffStatus()
  }, [])

  if (loading) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (error || !data) {
    return null // Don't show error - this is optional data
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg mb-3">
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">
            <strong>{data.signedOffCount} of {data.totalCount}</strong> expenses signed off
          </span>
          <span className="text-gray-700 font-semibold">{data.percentComplete}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
            style={{ width: `${data.percentComplete}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-green-600 font-semibold">✓ Signed</span>
          <div className="text-gray-900 font-bold">
            {typeof data.signedOffAmount === 'string' ? data.signedOffAmount : formatCurrency(data.signedOffAmount)}
          </div>
        </div>
        <div>
          <span className="text-orange-600 font-semibold">⏳ Pending</span>
          <div className="text-gray-900 font-bold">
            {typeof data.pendingAmount === 'string' ? data.pendingAmount : formatCurrency(data.pendingAmount)}
            <span className="text-gray-600 text-xs ml-1">({data.pendingCount} items)</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        Total: {typeof data.totalAmount === 'string' ? data.totalAmount : formatCurrency(data.totalAmount)}
      </div>
    </div>
  )
}

export default SignOffStatus
