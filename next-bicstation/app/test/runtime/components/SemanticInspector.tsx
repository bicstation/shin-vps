// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/components/SemanticInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Inspectors
============================================================================ */

import RuntimeInspectorRouter
from '../inspectors/orchestrators/RuntimeInspectorRouter'

/* ============================================================================
🔥 Types
============================================================================ */

type SemanticInspectorProps = {

  mode?: string

  runtime?: any
}

/* ============================================================================
🔥 Semantic Inspector
============================================================================ */

/**
 * Semantic runtime inspector gateway.
 *
 * Responsibilities:
 *
 * - semantic runtime inspector routing
 * - observatory continuity preservation
 * - semantic topology-safe inspector orchestration
 * - runtime inspector gateway continuity
 *
 * IMPORTANT:
 *
 * Frontend does NOT mutate semantic meaning.
 *
 * Backend remains semantic authority.
 */
export default function SemanticInspector({

  mode,

  runtime,

}: SemanticInspectorProps) {

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🧬 SEMANTIC INSPECTOR',

    {

      mode,

      runtimeRole:
        runtime?.runtime_role,

      topologyLayer:
        runtime?.topology_layer,

      observatory:
        runtime?.observatory,

      semanticSchema:

        runtime
          ?.semantic_schema_version,

      payloadKeys:
        runtime?.payload_keys,
    }
  )

  // ==========================================================================
  // Empty Runtime
  // ==========================================================================

  if (!runtime) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-zinc-900
          bg-zinc-950/40
          p-10
          text-sm
          text-zinc-500
        "
      >

        Semantic runtime unavailable

      </div>
    )
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <RuntimeInspectorRouter

      mode={mode}

      runtime={runtime}

    />

  )
}

