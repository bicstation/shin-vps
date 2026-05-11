// /app/concierge/types/events/events.ts

/* =========================================
🔥 EVENT TYPES
========================================= */

export type EventHandler<T = any> = (payload: T) => void

export type Event<T = any> = {
  type: string
  payload?: T
  timestamp?: string
}