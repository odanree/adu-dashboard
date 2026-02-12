/**
 * SignOffSection component - displays expense sign-off status
 */

import React, { useState } from 'react'
import dataService from '@services/data'

interface SignOffSectionProps {
  email: string
}

export const SignOffSection: React.FC<SignOffSectionProps> = ({ email }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSheetsLinkClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const response = await dataService.getSheetsLink(email)
    
    if (response.authorized && response.url) {
      window.open(response.url, '_blank')
    } else {
      setError(response.message || 'Access denied')
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg mb-2">
      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}
      <button
        onClick={handleSheetsLinkClick}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
      >
        {loading ? 'Loading...' : '📋 Open Expenses Sheet to Review (Column E)'}
      </button>
    </div>
  )
}

export default SignOffSection
