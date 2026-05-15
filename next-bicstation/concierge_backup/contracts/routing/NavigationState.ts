// /app/concierge/contracts/routing/NavigationState.ts

/* =========================================
🔥 Navigation State Contract
========================================= */

export type NavigationState = {
  currentRoute: string
  previousRoute?: string
  activeSection?: string

  params?: Record<string, any>

  canGoBack?: boolean
  canGoForward?: boolean

  timestamp: string
}