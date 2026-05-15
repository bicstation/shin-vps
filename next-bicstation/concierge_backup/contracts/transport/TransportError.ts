// /app/concierge/contracts/transport/TransportError.ts

/* =========================================
🔥 Transport Error Contract
========================================= */

export type TransportError = {
  errorId: string
  transport: string
  message: string
  stack?: string
  context?: Record<string, any>
  timestamp: string
}