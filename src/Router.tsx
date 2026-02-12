/**
 * Router - Main entry point
 */

import React, { useState } from 'react'
import useAuth from '@hooks/useAuth'
import App from './App'
import Admin from './pages/Admin'
import './styles/Router.css'

export const Router: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'admin'>('dashboard')
  const { isWhitelisted } = useAuth()

  return (
    <>
      {currentPage === 'dashboard' && (
        <>
          <App />
          {/* Admin link in footer - only visible to whitelisted users */}
          {isWhitelisted && (
            <div className="router-footer">
              <button
                onClick={() => setCurrentPage('admin')}
                className="router-link-button"
                type="button"
              >
                📊 Data Manager
              </button>
            </div>
          )}
        </>
      )}
      {currentPage === 'admin' && (
        <>
          <Admin />
          <div className="router-footer">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="router-link-button"
              type="button"
            >
              ← Back to Dashboard
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default Router
