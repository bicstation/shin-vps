// /app/concierge/types/contracts/contracts.ts

/* =========================================
🔥 CONTRACT TYPES
========================================= */

export type Contract<T = any> = {
  id: string
  name: string
  version?: string
  payload?: T
  created_at?: string
  updated_at?: string
}