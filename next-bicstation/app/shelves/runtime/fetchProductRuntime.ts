// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/runtime/fetchProductRuntime.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Product Runtime Fetch
 * ============================================================================
 *
 * PURPOSE:
 *   - fetch product runtime authority
 *   - fetch semantic discovery runtime
 *   - normalize frontend runtime access
 *
 * IMPORTANT:
 *   - backend owns semantic authority
 *   - frontend consumes runtime only
 *
 * ============================================================================
 */

import {
  buildEndpoint,
} from '@/shared/lib/api/django/pc/utils/buildEndpoint'

import type {
  ProductRuntimeResponse,
} from './contracts'

/* ============================================================================
🔥 Fetch Product Runtime
============================================================================ */

export async function fetchProductRuntime():

Promise<ProductRuntimeResponse> {

  try {

    /* ======================================================================
    🔥 Endpoint
    ====================================================================== */

    const endpoint =
      buildEndpoint(
        '/pc/'
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
        'Failed to fetch product runtime'
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
      '🔥 Product Runtime Error:',
      error
    )

    /* ======================================================================
    🔥 Safe Runtime
    ====================================================================== */

    return {

      success:
        false,

      count:
        0,

      products: [],
    }
  }
}