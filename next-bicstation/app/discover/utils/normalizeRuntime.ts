// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/utils/normalizeRuntime.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Runtime Normalization
 * ============================================================================
 *
 * PURPOSE:
 *   - normalize semantic runtime payloads
 *   - provide safe frontend runtime access
 *   - stabilize runtime renderer contracts
 *
 * IMPORTANT:
 *   - semantic authority belongs to backend
 *   - frontend normalizes access only
 *
 * ============================================================================
 */

import type {
  ProductRuntimeResponse,
  ProductRuntime,
  ShelfRuntime,
} from '../runtime/contracts'

/* ============================================================================
🔥 Normalize Product Runtime
============================================================================ */

export function normalizeProductRuntime(

  runtime?: ProductRuntimeResponse

): ProductRuntime[] {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (
    !runtime
    ||
    !Array.isArray(
      runtime?.products
    )
  ) {

    return []
  }

  /* ==========================================================================
  🔥 Normalize
  ========================================================================== */

  return runtime.products.filter(
    Boolean
  )
}

/* ============================================================================
🔥 Normalize Shelf Runtime
============================================================================ */

export function normalizeShelfRuntime(

  runtime?: ShelfRuntime[]

): ShelfRuntime[] {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (
    !runtime
    ||
    !Array.isArray(runtime)
  ) {

    return []
  }

  /* ==========================================================================
  🔥 Normalize
  ========================================================================== */

  return runtime.filter(
    shelf => (

      shelf
      &&

      typeof shelf ===
      'object'
    )
  )
}

/* ============================================================================
🔥 Normalize Products
============================================================================ */

export function normalizeProducts(

  products?: ProductRuntime[]

): ProductRuntime[] {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (
    !products
    ||
    !Array.isArray(
      products
    )
  ) {

    return []
  }

  /* ==========================================================================
  🔥 Normalize
  ========================================================================== */

  return products.filter(
    product => (

      product
      &&

      typeof product ===
      'object'
    )
  )
}

/* ============================================================================
🔥 Normalize Grouped Attributes
============================================================================ */

export function normalizeGroupedAttributes(

  groupedAttributes?: Record<
    string,
    any
  >

): Record<
  string,
  any[]
> {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (
    !groupedAttributes
    ||
    typeof groupedAttributes
    !== 'object'
  ) {

    return {}
  }

  /* ==========================================================================
  🔥 Normalize
  ========================================================================== */

  return Object.fromEntries(

    Object.entries(
      groupedAttributes
    )
      .map(
        ([
          key,
          value,
        ]) => [

          key,

          Array.isArray(
            value
          )

            ? value.filter(Boolean)

            : [],
        ]
      )
  )
}

/* ============================================================================
🔥 Safe Runtime Count
============================================================================ */

export function getRuntimeCount(

  runtime?: ProductRuntimeResponse

): number {

  return (
    runtime?.count
    ||

    runtime?.products?.length
    ||

    0
  )
}

/* ============================================================================
🔥 Export
============================================================================ */

const normalizeRuntime = {

  normalizeProductRuntime,

  normalizeShelfRuntime,

  normalizeProducts,

  normalizeGroupedAttributes,

  getRuntimeCount,
}

export default normalizeRuntime