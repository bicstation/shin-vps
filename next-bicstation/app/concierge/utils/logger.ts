// /app/concierge/utils/logger.ts

/* =========================================
🔥 LOGGER UTILITIES
========================================= */

export function logInfo(...args: any[]) {
  console.info('[INFO]', ...args)
}

export function logWarn(...args: any[]) {
  console.warn('[WARN]', ...args)
}

export function logError(...args: any[]) {
  console.error('[ERROR]', ...args)
}

export function logDebug(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[DEBUG]', ...args)
  }
}