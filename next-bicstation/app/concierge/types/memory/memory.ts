// /app/concierge/types/memory/memory.ts

/* =========================================
🔥 MEMORY TYPES
========================================= */

export type MemoryEntry<T = any> = {
  id: string
  type: string
  data: T
  createdAt?: string
  updatedAt?: string
}

export type MemoryStore<T = any> = {
  [key: string]: MemoryEntry<T>
}