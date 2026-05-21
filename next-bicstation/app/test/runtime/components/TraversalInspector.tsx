// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/components/TraversalInspector.tsx
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

type TraversalInspectorProps = {

  mode?: string

  runtime?: any
}

/* ============================================================================
🔥 Traversal Inspector
============================================================================ */

/**
 * Traversal runtime inspector gateway.
 *
 * Responsibilities:
 *
 * - traversal inspector routing
 * - continuation runtime observability
 * - semantic traversal continuity preservation
 * - exploration topology-safe inspector orchestration
 *
 * IMPORTANT:
 *
 * Frontend does NOT mutate semantic meaning.
 *
 * Backend remains semantic authority.
 */
export default function TraversalInspector({

  mode,

  runtime,

}: TraversalInspectorProps) {

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🌌 TRAVERSAL INSPECTOR',

    {

      mode,

      runtimeRole:
        runtime?.runtime_role,

      topologyLayer:
        runtime?.topology_layer,

      observatory:
        runtime?.observatory,

      traversalEdges:

        Array.isArray(
          runtime?.traversal_edges
        )

          ? runtime.traversal_edges.length

          : 0,

      traversalGraph:

        Array.isArray(
          runtime?.traversal_graph
        )

          ? runtime.traversal_graph.length

          : 0,
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

        Traversal runtime unavailable

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

