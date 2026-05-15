// /app/concierge/transport/cache/cacheTransport.ts

/* =========================================
🔥 CACHE TRANSPORT
========================================= */

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

export class CacheTransport {

  private cache: Map<string, CacheEntry<any>> = new Map()

  constructor(private defaultTTL: number = 60 * 1000) {}

  /* ======================================
  Set cache
  ====================================== */
  set<T>(key: string, value: T, ttl?: number) {
    const expireTime = Date.now() + (ttl ?? this.defaultTTL)
    this.cache.set(key, { value, expiresAt: expireTime })
  }

  /* ======================================
  Get cache
  ====================================== */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return undefined
    }
    return entry.value
  }

  /* ======================================
  Clear cache
  ====================================== */
  clear() {
    this.cache.clear()
  }
}