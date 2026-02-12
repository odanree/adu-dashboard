/**
 * Custom hook for fetching and managing ADU data
 */

import { useState, useEffect, useCallback } from 'react'
import dataService from '@services/data'
import type { ADUData } from '@types'

interface UseFetchADUDataReturn {
  data: ADUData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  refresh: () => Promise<void>
}

export const useFetchADUData = (): UseFetchADUDataReturn => {
  const [data, setData] = useState<ADUData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await dataService.fetchADUData()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await dataService.refreshData()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh data'
      setError(message)
      console.error('Refresh error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    refresh: refreshData,
  }
}

export default useFetchADUData
