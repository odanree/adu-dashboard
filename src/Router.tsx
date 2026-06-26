/**
 * Router - Main entry point
 */

import type React from 'react'
import { useState, useEffect } from 'react'
import useAuth from '@hooks/useAuth'
import App from './App'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import './styles/Router.css'

type Page = 'dashboard' | 'admin' | 'privacy' | 'terms'

export const Router: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const { isWhitelisted } = useAuth()

  useEffect(() => {
    const handleNavigation = (event: Event) => {
      const customEvent = event as CustomEvent
      const page = customEvent.detail as Page
      if (['dashboard', 'admin', 'privacy', 'terms'].includes(page)) {
        setCurrentPage(page)
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('navigate', handleNavigation)
    return () => window.removeEventListener('navigate', handleNavigation)
  }, [])

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
      {currentPage === 'privacy' && (
        <Privacy />
      )}
      {currentPage === 'terms' && (
        <Terms />
      )}
    </>
  )
}

export default Router
