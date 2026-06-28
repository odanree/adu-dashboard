/**
 * Authentication service for Google Sign-In and session management
 */

import type { AuthSession } from '@types'
import apiClient from '@services/api'

const SESSION_KEY = 'aduDashboardSession'
const SESSION_EXPIRY_HOURS = 24

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
   * Check if user email is whitelisted via backend (sees full budget with overhead).
   * Backend env (WHITELISTED_EMAILS) is the single source of truth — Vercel doesn't
   * need VITE_WHITELISTED_EMAILS set anymore. Fails closed if backend unreachable.
   */
  async checkWhitelist(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ whitelisted: boolean }>(
        '/api/whitelist-check',
        { params: { email } }
      )
      return response.data.whitelisted === true
    } catch {
      return false
    }
  },

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
