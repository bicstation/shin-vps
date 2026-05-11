// /app/concierge/utils/format.ts

/* =========================================
🔥 FORMAT UTILITIES
========================================= */

export function formatPrice(value?: number): string {
  if (typeof value !== 'number') return '¥0'
  return `¥${value.toLocaleString()}`
}

export function formatPercentage(value?: number): string {
  if (typeof value !== 'number') return '0%'
  return `${Math.round(value * 100)}%`
}

export function truncateString(str: string, length: number): string {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '…' : str
}