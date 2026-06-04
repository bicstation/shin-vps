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
  // Semantic Runtime Debug
  // ======================================

  console.log(

    '🔥 SEMANTIC RUNTIME PAYLOAD',

    {

      runtime,

      endpoint,

      semantic_schema_version:

        (result.data as any)
          ?.semantic_schema_version,

      has_semantic_runtime:

        !!(result.data as any)
          ?.semantic_runtime,

      has_adaptive_runtime:

        !!(result.data as any)
          ?.adaptive_runtime,

      has_semantic_related:

        !!(result.data as any)
          ?.semantic_related,

      payload_keys:

        Object.keys(
          (result.data as any) || {}
        ),

      payload_type:

        Array.isArray(result.data)
          ? 'array'
          : typeof result.data,

      payload_exists:

        !!result.data,

      payload:
        result.data,
    }
  )

  // ======================================
  // Payload Safety
  // ======================================

  if (!result.data) {

    console.error(

      '🔥 EMPTY RUNTIME PAYLOAD',

      {

        runtime,

        endpoint,
      }
    )

    return null
  }

  // ======================================
  // Completion
  // ======================================

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(

    '✅ SAFE FETCH BRIDGE SUCCESS'
  )

  console.log(

    {

      runtime,

      endpoint,

      payload_received:
        true,
    }
  )

  console.log(

    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ======================================
  // Success
  // ======================================

  return result.data
}