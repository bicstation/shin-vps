// /app/concierge/types/core/common.ts

/* =========================================
🔥 CORE COMMON TYPES
========================================= */

export type Nullable<T> = T | null | undefined

export type KeyValue<T = any> = Record<string, T>

export type Timestamp = string | number | Date