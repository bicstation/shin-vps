// /app/concierge/contracts/transport/TransportResponse.ts

/* =========================================
🔥 Transport Response Contract
========================================= */

export type TransportResponse<T = any> = {
  requestId: string
  transport: string
  status: number
  data?: T
  error?: string
  timestamp: string
}