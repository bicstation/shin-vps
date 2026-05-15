// /app/concierge/contracts/transport/TransportRequest.ts

/* =========================================
🔥 Transport Request Contract
========================================= */

export type TransportRequest<T = any> = {
  requestId: string
  transport: string
  endpoint?: string
  payload: T
  sessionId?: string
  userId?: string
  timestamp: string
}