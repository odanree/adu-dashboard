/**
 * ADU data hook backed by TanStack Query.
 *
 * Preserves the original return shape ({ data, loading, error, refetch, refresh })
 * so existing consumers keep working. `refetch` re-runs the cached query;
 * `refresh` calls the server's /api/refresh endpoint, which forces a Sheets pull,
 * then primes the cache with the result.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import dataService from '@services/data'
import type { ADUData } from '@types'

export const aduDataQueryKey = ['adu-data'] as const

interface UseFetchADUDataReturn {
  data: ADUData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  refresh: () => Promise<void>
}

export const useFetchADUData = (): UseFetchADUDataReturn => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: aduDataQueryKey,
    queryFn: () => dataService.fetchADUData(),
  })

  const refresh = async () => {
    const fresh = await dataService.refreshData()
    queryClient.setQueryData<ADUData>(aduDataQueryKey, fresh)
  }

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: async () => {
      await query.refetch()
    },
    refresh,
  }
}

export default useFetchADUData
