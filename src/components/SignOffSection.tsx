/**
 * SignOffSection component - displays expense sign-off status
 */

import type React from 'react'
import { useMutation } from '@tanstack/react-query'
import dataService from '@services/data'

interface SignOffSectionProps {
  email: string
}

export const SignOffSection: React.FC<SignOffSectionProps> = ({ email }) => {
  const sheetsLink = useMutation({
    mutationFn: (targetEmail: string) => dataService.getSheetsLink(targetEmail),
    onSuccess: (response) => {
      if (response.authorized && response.url) {
        window.open(response.url, '_blank')
      }
    },
  })

  const error =
    sheetsLink.data && !sheetsLink.data.authorized
      ? sheetsLink.data.message || 'Access denied'
      : null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg mb-2">
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          sheetsLink.mutate(email)
        }}
        disabled={sheetsLink.isPending}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        {sheetsLink.isPending ? 'Loading...' : '📋 Open Expenses Sheet to Review (Column E)'}
      </button>
    </div>
  )
}

export default SignOffSection
