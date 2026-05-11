// /app/concierge/types/transport/transport.ts

/* =========================================
🔥 TRANSPORT TYPES
========================================= */

export type TransportRequest<T = any> = {
  endpoint: string
  payload?: T
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
}

export type TransportResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  status?: number
}