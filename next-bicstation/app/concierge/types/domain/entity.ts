// /app/concierge/types/domain/entity.ts

/* =========================================
🔥 DOMAIN ENTITY TYPES
========================================= */

export type EntityId = string

export type DomainEntity<T = any> = {
  id: EntityId
  type: string
  payload: T
  createdAt?: string
  updatedAt?: string
}