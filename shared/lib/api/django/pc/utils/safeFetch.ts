// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/safeFetch.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/**
 * SHIN CORE LINX
 * Legacy Safe Fetch Bridge
 *
 * IMPORTANT:
 * Canonical transport authority now lives in:
 *
 * runtime/transport/safeRuntimeFetch.ts
 *
 * This file remains as:
 * - compatibility layer
 * - migration bridge
 * - legacy import stabilizer
 *
 * Migration Philosophy:
 * utils/ → runtime/transport
 */

import {
  safeRuntimeFetch,
} from '../runtime/transport/safeRuntimeFetch'

/* =========================================
🔥 Types
========================================= */

export type SafeFetchOptions =

RequestInit & {

  timeout?: number

}

/* =========================================
🔥 Safe Fetch Bridge
========================================= */

/**
 * Legacy safeFetch compatibility bridge.
 *
 * IMPORTANT:
 * Semantic transport authority is now:
 *
 * runtime/transport/safeRuntimeFetch.ts
 *
 * Existing frontend runtime pipelines
 * continue functioning through this bridge.
 */
export async function
safeFetch<T = any>(

  endpoint: string,

  options?: SafeFetchOptions

): Promise<T | null> {

  // ======================================
  // Runtime
  // ======================================

  const runtime =

    typeof window === 'undefined'
      ? 'SSR'
      : 'CSR'

  // ======================================
  // Bridge Start
  // ======================================

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '🔥 SAFE FETCH BRIDGE START'
  )

  console.log(

    {

      runtime,

      endpoint,

      migration:
        'utils → runtime/transport',

      method:
        options?.method || 'GET',

      timeout:
        options?.timeout || 15000,
    }
  )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ======================================
  // Runtime Transport
  // ======================================

  const result =

    await safeRuntimeFetch<T>(
      endpoint,
      options,
    )

  // ======================================
  // Raw Transport Result
  // ======================================

  console.log(

    '🔥 RAW TRANSPORT RESULT',

    {

      runtime,

      endpoint,

      success:
        result.success,

      status:
        result.status,

      has_data:
        !!result.data,

      has_error:
        !!result.error,

      result,
    }
  )

  // ======================================
  // Runtime Failure
  // ======================================

  if (!result.success) {

    console.error(

      '🔥 SAFE FETCH BRIDGE ERROR',

      {

        runtime,

        endpoint,

        status:
          result.status,

        error:
          result.error,
      }
    )

    console.log(

      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(

      '🔥 SAFE FETCH BRIDGE FAILED'
    )

    console.log(

      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    return null
  }

  // ======================================
  // Runtime Observability
  // ======================================

  const payload =

    result.data as any

  const runtimeSignals = {

    semantic_runtime:

      Boolean(

        payload?.semantic_runtime ||

        payload?.data?.semantic_runtime
      ),

    product_runtime:

      Boolean(

        payload?.product ||

        payload?.data?.product
      ),

    compiled_runtime:

      Boolean(

        payload?.compiled_runtime ||

        payload?.data?.compiled_runtime
      ),

    product_semantic_runtime:

      Boolean(

        payload?.product_semantic_runtime ||

        payload?.data?.product_semantic_runtime
      ),

    adaptive_runtime:

      Boolean(

        payload?.adaptive_runtime ||

        payload?.data?.adaptive_runtime
      ),

    semantic_related:

      Boolean(

        payload?.semantic_related ||

        payload?.data?.semantic_related
      ),
  }

  // ======================================
  // Runtime Debug
  // ======================================

  console.log(

    '🔥 RUNTIME SIGNALS',

    {

      runtime,

      endpoint,

      semantic_schema_version:

        payload?.semantic_schema_version,

      runtimeSignals,

      payload_keys:

        Object.keys(
          payload || {}
        ),

      payload_type:

        Array.isArray(payload)
          ? 'array'
          : typeof payload,

      payload_exists:

        !!payload,

      payload,
    }
  )

  // ======================================
  // Success
  // ======================================

  return result.data
}