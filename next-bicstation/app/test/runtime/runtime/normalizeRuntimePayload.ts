// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/runtime/normalizeRuntimePayload.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Runtime Preservation Layer
 *
 * IMPORTANT:
 * This file is NOT a semantic transformation layer.
 *
 * This file represents:
 *
 * semantic runtime preservation authority
 *
 * Responsibilities:
 * - shallow stabilization
 * - runtime safety
 * - traversal-safe shaping
 * - inspector-safe payload handling
 * - null safety
 * - runtime observability stabilization
 *
 * IMPORTANT:
 * This file MUST NOT:
 *
 * ❌ mutate semantic meaning
 * ❌ rewrite workflow logic
 * ❌ regroup semantic entities
 * ❌ infer new semantics
 * ❌ modify traversal meaning
 *
 * Backend remains:
 *
 * semantic authority
 * meaning authority
 * traversal authority
 */

/* ============================================================================
🔥 Imports
============================================================================ */

import type {

  RuntimeFetchResult,

} from './fetchRuntime'

/* ============================================================================
🔥 Normalized Runtime Payload
============================================================================ */

export type NormalizedRuntimePayload<T = any> = {

  success: boolean

  endpoint: string

  runtime_role: string

  topology_layer: string

  observatory: string

  fetched_at: string

  duration_ms: number

  payload: T

  semantic_schema_version: string | null

  has_semantic_runtime: boolean

  has_adaptive_runtime: boolean

  has_semantic_related: boolean

  payload_size: number

  payload_type: string

  payload_keys: string[]

}

/* ============================================================================
🔥 Normalize Runtime Payload
============================================================================ */

export function normalizeRuntimePayload<T = any>(

  runtime:

    RuntimeFetchResult<T>

): NormalizedRuntimePayload<T> {

  /* ==========================================================================
  🔥 Runtime Failure
  ========================================================================== */

  if (!runtime.success || !runtime.payload) {

    console.warn(

      '⚠️ NORMALIZE RUNTIME PAYLOAD FAILURE',

      {

        endpoint:
          runtime.endpoint,

        runtime_role:
          runtime.runtime_role,
      }
    )

    return {

      success: false,

      endpoint:
        runtime.endpoint,

      runtime_role:
        runtime.runtime_role,

      topology_layer:
        runtime.topology_layer,

      observatory:
        runtime.observatory,

      fetched_at:
        runtime.fetched_at,

      duration_ms:
        runtime.duration_ms,

      payload:
        {} as T,

      semantic_schema_version:
        null,

      has_semantic_runtime:
        false,

      has_adaptive_runtime:
        false,

      has_semantic_related:
        false,

      payload_size:
        0,

      payload_type:
        'null',

      payload_keys:
        [],
    }
  }

  /* ==========================================================================
  🔥 Runtime Payload
  ========================================================================== */

  const payload =

    runtime.payload as any

  /* ==========================================================================
  🔥 Payload Keys
  ========================================================================== */

  const payloadKeys =

    typeof payload === 'object'
      && payload !== null

      ? Object.keys(payload)

      : []

  /* ==========================================================================
  🔥 Payload Type
  ========================================================================== */

  const payloadType =

    Array.isArray(payload)
      ? 'array'

      : typeof payload

  /* ==========================================================================
  🔥 Payload Size
  ========================================================================== */

  let payloadSize = 0

  try {

    payloadSize =

      JSON.stringify(payload)
        ?.length || 0

  } catch {

    payloadSize = 0
  }

  /* ==========================================================================
  🔥 Runtime Observatory
  ========================================================================== */

  console.log(

    '🧠 NORMALIZED RUNTIME PAYLOAD',

    {

      endpoint:
        runtime.endpoint,

      runtime_role:
        runtime.runtime_role,

      topology_layer:
        runtime.topology_layer,

      semantic_schema_version:

        payload
          ?.semantic_schema_version
          || null,

      has_semantic_runtime:

        !!payload
          ?.semantic_runtime,

      has_adaptive_runtime:

        !!payload
          ?.adaptive_runtime,

      has_semantic_related:

        !!payload
          ?.semantic_related,

      payload_type:
        payloadType,

      payload_size:
        payloadSize,

      payload_keys:
        payloadKeys,
    }
  )

  /* ==========================================================================
  🔥 Runtime Success
  ========================================================================== */

  return {

    success:
      runtime.success,

    endpoint:
      runtime.endpoint,

    runtime_role:
      runtime.runtime_role,

    topology_layer:
      runtime.topology_layer,

    observatory:
      runtime.observatory,

    fetched_at:
      runtime.fetched_at,

    duration_ms:
      runtime.duration_ms,

    payload:
      runtime.payload,

    semantic_schema_version:

      payload
        ?.semantic_schema_version
        || null,

    has_semantic_runtime:

      !!payload
        ?.semantic_runtime,

    has_adaptive_runtime:

      !!payload
        ?.adaptive_runtime,

    has_semantic_related:

      !!payload
        ?.semantic_related,

    payload_size:
      payloadSize,

    payload_type:
      payloadType,

    payload_keys:
      payloadKeys,
  }
}

/* ============================================================================
🔥 Runtime Preservation Rules
============================================================================ */

/**
 * IMPORTANT:
 *
 * normalizeRuntimePayload()
 * is:
 *
 * preservation layer
 *
 * NOT:
 *
 * semantic mutation layer
 *
 * Allowed:
 *
 * ✅ null safety
 * ✅ shallow stabilization
 * ✅ payload observability
 * ✅ traversal-safe shaping
 *
 * Forbidden:
 *
 * ❌ semantic regrouping
 * ❌ workflow mutation
 * ❌ edge meaning rewrite
 * ❌ semantic inference
 * ❌ traversal mutation
 */

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeRuntimePayload