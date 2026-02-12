/**
 * Header component - navigation and branding
 */

import React, { useState, useEffect } from 'react'

interface HeaderProps {
  isSignedIn: boolean
  email: string | null
  onSignOut: () => void
  onTestSignInClick?: () => void
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
          revoke: (email: string) => void
        }
      }
    }
  }
}

export const Header: React.FC<HeaderProps> = ({ isSignedIn, email, onSignOut, onTestSignInClick }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isSignedIn && window.google?.accounts?.id) {
      try {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890.apps.googleusercontent.com',
          callback: (response: any) => {
            if (response.credential) {
              // Handle the JWT credential
              try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]))
                // Save to session and reload
                localStorage.setItem('aduDashboardSession', JSON.stringify({
                  email: payload.email,
                  signedInAt: Date.now(),
                }))
                window.location.reload()
              } catch (e) {
                console.error('Failed to parse credential:', e)
              }
            }
          },
        })

        // Render the sign-in button
        const signInEl = document.getElementById('googleSignIn')
        if (signInEl && !signInEl.querySelector('div[role="button"]')) {
          window.google.accounts.id.renderButton(signInEl, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
          })
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error)
      }
    }
  }, [isSignedIn])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled ? 'shadow-lg' : ''
      } bg-opacity-95 backdrop-blur`}
      style={{
        background: scrolled
          ? 'rgba(102, 126, 234, 0.95)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="container mx-auto px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between max-w-6xl gap-4 md:gap-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">🏗️ ADU Dashboard</h1>
        </div>

        {/* Auth Section */}
        <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-blue-100">Signed in as</div>
                <div className="text-white font-semibold">{email}</div>
              </div>
              <button
                onClick={onSignOut}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <div id="googleSignIn" className="w-full md:w-auto" />
              {/* Development test sign-in button */}
              {import.meta.env.VITE_ENV === 'development' && (
                <button
                  onClick={onTestSignInClick}
                  className="w-full md:w-auto px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm whitespace-nowrap"
                  title="Test different user roles"
                >
                  🧪 Test Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
