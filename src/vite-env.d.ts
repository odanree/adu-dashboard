/**
 * Global type declarations for the ADU Dashboard
 */

import type React from 'react'

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>
  export default content
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_ENV: string
    readonly VITE_WHITELISTED_EMAILS: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
          revoke: (email?: string) => void
          onLoad?: (callback: () => void) => void
        }
        oauth2?: {
          initTokenClient: (config: Record<string, unknown>) => unknown
        }
      }
    }
  }
}

export {}
