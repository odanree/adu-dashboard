/**
 * Authentication service for Google Sign-In and session management
 */

import type { AuthSession } from '@types'

const SESSION_KEY = 'aduDashboardSession'
const SESSION_EXPIRY_HOURS = 24

// Whitelist of emails that see the full budget (with overhead/profit)
// Loaded from environment variables
const WHITELISTED_EMAILS = (
  import.meta.env.VITE_WHITELISTED_EMAILS as string || ''
).split(',').map((email: string) => email.trim().toLowerCase()).filter((email: string) => email.length > 0)

export const authService = {
  /**
   * Save authentication session to localStorage
   */
  saveSession(email: string): void {
    const session: AuthSession = {
      email,
      signedInAt: Date.now(),
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },

  /**
   * Get current session from localStorage
   */
  getSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY)
      if (!data) return null

      const session: AuthSession = JSON.parse(data)

      // Check if session has expired
      const sessionAgeHours = (Date.now() - session.signedInAt) / (1000 * 60 * 60)
      if (sessionAgeHours > SESSION_EXPIRY_HOURS) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error('Error parsing session:', error)
      this.clearSession()
      return null
    }
  },

  /**
   * Check if user email is whitelisted (sees full budget with overhead)
   */
  isWhitelisted(): boolean {
    const email = this.getCurrentEmail()
    return email ? WHITELISTED_EMAILS.includes(email) : false
  },

  /**
  isSignedIn(): boolean {
    return this.getSession() !== null
  },

  /**
   * Get current user email
   */
  getCurrentEmail(): string | null {
    const session = this.getSession()
    return session?.email || null
  },

  /**
   * Clear session
   */
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY)
  },

  /**
   * Handle Google Sign-In callback
   */
  handleGoogleSignIn(credential: string): boolean {
    try {
      // Decode JWT (simplified - in production, verify on backend)
      const parts = credential.split('.')
      if (parts.length !== 3) return false

      const payload = JSON.parse(atob(parts[1]))

      if (payload.email) {
        this.saveSession(payload.email)
        return true
      }
      return false
    } catch (error) {
      console.error('Error handling Google Sign-In:', error)
      return false
    }
  },

  /**
   * Sign out user
   */
  signOut(): void {
    this.clearSession()

    // Revoke Google credential if available
    if (window.google?.accounts?.id) {
      window.google.accounts.id.revoke('')
    }
  },
}

export default authService
