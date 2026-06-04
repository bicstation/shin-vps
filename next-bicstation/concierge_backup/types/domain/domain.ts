// /app/concierge/types/domain/domain.ts

/* =========================================
🔥 DOMAIN TYPES
========================================= */

export type DomainEntity<T = any> = {
  id: string
  type: string
  data: T
  created_at?: string
  updated_at?: string
}