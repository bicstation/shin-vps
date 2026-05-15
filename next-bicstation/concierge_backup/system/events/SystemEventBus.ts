// /app/concierge/system/events/SystemEventBus.ts

/* =========================================
🔥 SYSTEM EVENT BUS
========================================= */

type EventCallback<T = any> = (payload: T) => void

export class SystemEventBus {

  private listeners: Record<string, EventCallback[]> = {}

  /* ======================================
  Subscribe
  ====================================== */
  on<T>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(callback)
  }

  /* ======================================
  Emit
  ====================================== */
  emit<T>(event: string, payload?: T) {
    const cbs = this.listeners[event] || []
    cbs.forEach(cb => cb(payload))
  }

  /* ======================================
  Remove Listener
  ====================================== */
  off<T>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
  }

  /* ======================================
  Clear All
  ====================================== */
  clear() {
    this.listeners = {}
  }
}