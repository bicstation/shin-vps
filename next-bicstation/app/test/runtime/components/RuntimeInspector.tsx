// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/components/RuntimeInspector.tsx
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

type RuntimeInspectorProps = {

  mode?: string

  runtime?: any
}

/* ============================================================================
🔥 Runtime Inspector
============================================================================ */

/**
 * Canonical runtime inspector gateway.
 *
 * Responsibilities:
 *
 * - runtime inspector routing
 * - observatory continuity
 * - semantic runtime inspector orchestration
 * - topology-safe inspector rendering
 *
 * IMPORTANT:
 *
 * Frontend does NOT mutate semantic meaning.
 *
 * Backend remains semantic authority.
 */
export default function RuntimeInspector({

  mode,

  runtime,

}: RuntimeInspectorProps) {

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🧠 RUNTIME INSPECTOR',

    {

      mode,

      runtimeRole:
        runtime?.runtime_role,

      topologyLayer:
        runtime?.topology_layer,

      observatory:
        runtime?.observatory,

      endpoint:
        runtime?.endpoint,

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

        Runtime unavailable

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

