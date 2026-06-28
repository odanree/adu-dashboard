/**
 * Custom hook for managing authentication state
 */

import { useState, useEffect, useCallback } from 'react'
import authService from '@services/auth'

interface UseAuthReturn {
  isSignedIn: boolean
  email: string | null
  isWhitelisted: boolean
  signIn: (credential: string) => void
  signOut: () => void
  loading: boolean
}

export const useAuth = (): UseAuthReturn => {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = authService.getSession()
    if (session) {
      setIsSignedIn(true)
      setEmail(session.email)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!email) {
      setIsWhitelisted(false)
      return
    }
    let cancelled = false
    authService.checkWhitelist(email).then(result => {
      if (!cancelled) setIsWhitelisted(result)
    })
    return () => {
      cancelled = true
    }
  }, [email])

  const handleSignIn = useCallback((credential: string) => {
    const success = authService.handleGoogleSignIn(credential)
    if (success) {
      const session = authService.getSession()
      setIsSignedIn(true)
      setEmail(session?.email || null)
    }
  }, [])

  const handleSignOut = useCallback(() => {
    authService.signOut()
    setIsSignedIn(false)
    setEmail(null)
    setIsWhitelisted(false)
  }, [])

  return {
    isSignedIn,
    email,
    isWhitelisted,
    signIn: handleSignIn,
    signOut: handleSignOut,
    loading,
  }
}

export default useAuth
