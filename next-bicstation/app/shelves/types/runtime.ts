// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/types/runtime.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Runtime Types
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic runtime composition types
 *   - shelf orchestration typing
 *   - runtime rendering contracts
 *
 * IMPORTANT:
 *   - backend owns semantic authority
 *   - frontend consumes runtime structure only
 *
 * ============================================================================
 */

import type {
  Product,
} from './product'

/* ============================================================================
🔥 Semantic Shelf
============================================================================ */

export type SemanticShelf = {

  attribute: string

  title: string

  description: string
}

/* ============================================================================
🔥 Shelf Runtime
============================================================================ */

export type ShelfRuntime = {

  attribute: string

  title: string

  description: string

  products: Product[]
}

/* ============================================================================
🔥 Product Runtime
============================================================================ */

export type ProductRuntime = {

  success?: boolean

  count?: number

  products?: Product[]
}

/* ============================================================================
🔥 Runtime Layout
============================================================================ */

export type RuntimeLayout = {

  hero: {

    eyebrow: string

    title: string

    description: string
  }

  shelves: SemanticShelf[]
}

/* ============================================================================
🔥 Runtime Debug
============================================================================ */

export type RuntimeDebug = {

  productRuntime?: ProductRuntime

  shelfRuntime?: ShelfRuntime[]
}

/* ============================================================================
🔥 Runtime Section
============================================================================ */

export type RuntimeSection = {

  id?: string

  title?: string

  description?: string
}

/* ============================================================================
🔥 Loading State
============================================================================ */

export type LoadingState = {

  loading?: boolean

  error?: string | null
}

/* ============================================================================
🔥 Export
============================================================================ */

export default RuntimeLayout