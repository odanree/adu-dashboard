/**
 * Custom hook for managing authentication state
 */

import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
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
  // Read session ONCE at mount via useState initializer. Previously this
  // was a useEffect that setIsSignedIn/setEmail/setLoading — three
  // "initialize state in an effect" anti-patterns. authService.getSession()
  // is synchronous, so deriving initial state at construction time is
  // correct.
  const [initialSession] = useState(() => authService.getSession())
  const [isSignedIn, setIsSignedIn] = useState(!!initialSession)
  const [email, setEmail] = useState<string | null>(initialSession?.email ?? null)

  // Whitelist check via React Query — eliminates the useEffect that
  // previously drove the async fetch + setState. React Query owns the
  // cache, loading state, and cancellation on email change. Same
  // network behavior; no anti-patterns.
  const whitelistQuery = useQuery({
    queryKey: ['whitelist', email],
    queryFn: () => (email ? authService.checkWhitelist(email) : Promise.resolve(false)),
    enabled: !!email,
    // Stale-forever: whitelist status doesn't change during a session.
    // If it did, the user would need to re-authenticate anyway.
    staleTime: Number.POSITIVE_INFINITY,
  })

  const handleSignIn = useCallback((credential: string) => {
    const success = authService.handleGoogleSignIn(credential)
    if (!success) return
    const session = authService.getSession()
    setIsSignedIn(true)
    setEmail(session?.email || null)
  }, [])

  const handleSignOut = useCallback(() => {
    authService.signOut()
    setIsSignedIn(false)
    setEmail(null)
  }, [])

  return {
    isSignedIn,
    email,
    isWhitelisted: whitelistQuery.data ?? false,
    signIn: handleSignIn,
    signOut: handleSignOut,
    // "loading" now derives from React Query's fetching state. No email
    // (signed out) → not loading. Query in flight → loading. Result
    // cached → not loading.
    loading: !!email && whitelistQuery.isPending,
  }
}

export default useAuth
