// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/runtime/fetchRuntimeDebug.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Runtime Debug Fetch
 * ============================================================================
 *
 * PURPOSE:
 *   - runtime inspector payload fetch
 *   - semantic runtime debug authority
 *   - frontend runtime inspection tooling
 *
 * IMPORTANT:
 *   - debug mode is inspection only
 *   - semantic authority remains backend
 *
 * ============================================================================
 */

import {
  fetchProductRuntime,
} from './fetchProductRuntime'

import {
  fetchSemanticShelfRuntime,
} from './fetchSemanticShelfRuntime'

import type {
  ProductRuntimeResponse,
  ShelfRuntime,
} from './contracts'

/* ============================================================================
🔥 Runtime Debug Response
============================================================================ */

export type RuntimeDebugResponse = {

  productRuntime:
    ProductRuntimeResponse

  shelfRuntime:
    ShelfRuntime[]
}

/* ============================================================================
🔥 Fetch Runtime Debug
============================================================================ */

export async function fetchRuntimeDebug(

  attributes: string[] = []

): Promise<RuntimeDebugResponse> {

  try {

    /* ======================================================================
    🔥 Product Runtime
    ====================================================================== */

    const productRuntime =
      await fetchProductRuntime()

    /* ======================================================================
    🔥 Shelf Runtime
    ====================================================================== */

    const shelfRuntime =
      await Promise.all(

        attributes.map(
          async (
            attribute
          ) => {

            const runtime =
              await fetchSemanticShelfRuntime(
                attribute
              )

            return {

              attribute,

              title:
                attribute,

              description:
                'runtime debug shelf',

              products:
                runtime?.products
                || [],
            }
          }
        )
      )

    /* ======================================================================
    🔥 Return
    ====================================================================== */

    return {

      productRuntime,

      shelfRuntime,
    }

  } catch (error) {

    console.error(
      '🔥 Runtime Debug Error:',
      error
    )

    /* ======================================================================
    🔥 Safe Runtime
    ====================================================================== */

    return {

      productRuntime: {

        success:
          false,

        count:
          0,

        products: [],
      },

      shelfRuntime: [],
    }
  }
}