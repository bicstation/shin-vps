// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/runtime/fetchSemanticShelfRuntime.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Semantic Shelf Runtime Fetch
 * ============================================================================
 *
 * PURPOSE:
 *   - fetch semantic shelf runtime authority
 *   - fetch workflow-specific discovery runtime
 *   - frontend semantic shelf runtime access
 *
 * IMPORTANT:
 *   - semantic grouping authority is backend
 *   - frontend does not infer semantic meaning
 *
 * ============================================================================
 */

import {
  buildEndpoint,
} from '@/shared/lib/api/django/pc/utils/buildEndpoint'

import type {
  SemanticShelfRuntimeResponse,
} from './contracts'

/* ============================================================================
🔥 Fetch Semantic Shelf Runtime
============================================================================ */

export async function fetchSemanticShelfRuntime(

  attribute: string

): Promise<SemanticShelfRuntimeResponse> {

  try {

    /* ======================================================================
    🔥 Endpoint
    ====================================================================== */

    const endpoint =
      buildEndpoint(
        `/general/pc-products/?attribute=${attribute}`
      )

    /* ======================================================================
    🔥 Fetch
    ====================================================================== */

    const response =
      await fetch(
        endpoint,
        {
          cache:
            'no-store',
        }
      )

    /* ======================================================================
    🔥 Error
    ====================================================================== */

    if (!response.ok) {

      throw new Error(
        `Failed to fetch semantic shelf runtime: ${attribute}`
      )
    }

    /* ======================================================================
    🔥 JSON
    ====================================================================== */

    const runtime =
      await response.json()

    /* ======================================================================
    🔥 Return
    ====================================================================== */

    return runtime

  } catch (error) {

    console.error(
      '🔥 Semantic Shelf Runtime Error:',
      attribute,
      error
    )

    /* ======================================================================
    🔥 Safe Runtime
    ====================================================================== */

    return {

      success:
        false,

      shelf:
        attribute,

      count:
        0,

      products: [],
    }
  }
}