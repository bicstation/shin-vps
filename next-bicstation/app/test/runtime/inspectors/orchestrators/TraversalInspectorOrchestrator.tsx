// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/orchestrators/TraversalInspectorOrchestrator.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Traversal Inspector Orchestrator
 * ============================================================================
 *
 * PURPOSE:
 *
 * Traversal runtime observability orchestration
 *
 * IMPORTANT:
 *
 * This orchestrator exists for:
 *
 * traversal-runtime inspector composition
 *
 * NOT:
 *
 * graph mutation
 * semantic normalization
 * traversal rewriting
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Traversal Inspectors
============================================================================ */

import TraversalRuntimeInspector
from '../semantic/traversal/TraversalRuntimeInspector'

import TraversalContinuityInspector
from '../semantic/traversal/TraversalContinuityInspector'

import TraversalGraphInspector
from '../semantic/traversal/TraversalGraphInspector'

import TraversalEdgeInspector
from '../semantic/traversal/TraversalEdgeInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type TraversalInspectorOrchestratorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Traversal Inspector Orchestrator
============================================================================ */

export default function TraversalInspectorOrchestrator({

  runtime,

}: TraversalInspectorOrchestratorProps) {

  /* ==========================================================================
  🔥 Payload
  ========================================================================== */

  const payload =

    runtime?.payload
    || {}

  /* ==========================================================================
  🔥 Traversal Runtime
  ========================================================================== */

  const traversalRuntime =

    payload?.traversal_runtime
    || {}

  /* ==========================================================================
  🔥 Traversal Graph
  ========================================================================== */

  const traversalGraph =

    Array.isArray(
      payload?.traversal_graph
    )

      ? payload.traversal_graph

      : []

  /* ==========================================================================
  🔥 Traversal Edges
  ========================================================================== */

  const traversalEdges =

    Array.isArray(
      payload?.traversal_edges
    )

      ? payload.traversal_edges

      : []

  /* ==========================================================================
  🔥 Continuation Runtime
  ========================================================================== */

  const continuationRuntime =

    payload?.continuation_runtime
    || {}

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🛰️ TRAVERSAL INSPECTOR ORCHESTRATOR',

    {

      runtimeRole:

        runtime?.runtime_role,

      topologyLayer:

        runtime?.topology_layer,

      endpoint:

        runtime?.endpoint,

      traversalGraph:

        traversalGraph.length,

      traversalEdges:

        traversalEdges.length,

      hasContinuationRuntime:

        !!payload?.continuation_runtime,
    }
  )

  /* ==========================================================================
  🔥 Observatory Stack
  ========================================================================== */

  return (

    <div className="space-y-8">

      {/* ================================================================
      🔥 Traversal Runtime
      ================================================================ */}

      <TraversalRuntimeInspector

        traversal_runtime={
          traversalRuntime
        }

      />

      {/* ================================================================
      🔥 Traversal Continuity
      ================================================================ */}

      <TraversalContinuityInspector

        continuation_runtime={
          continuationRuntime
        }

      />

      {/* ================================================================
      🔥 Traversal Graph
      ================================================================ */}

      <TraversalGraphInspector

        traversal_graph={
          traversalGraph
        }

      />

      {/* ================================================================
      🔥 Traversal Edges
      ================================================================ */}

      <TraversalEdgeInspector

        traversal_edges={
          traversalEdges
        }

      />

    </div>
  )
}