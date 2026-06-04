// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/inspectors/orchestrators/TraversalInspectorOrchestrator.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Inspectors
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
🔥 Types
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

  // ==========================================================================
  // Canonical Runtime Topology
  // ==========================================================================

  const traversalGraph =

    Array.isArray(
      runtime?.traversal_graph
    )

      ? runtime.traversal_graph

      : []

  const traversalEdges =

    Array.isArray(
      runtime?.traversal_edges
    )

      ? runtime.traversal_edges

      : []

  const relatedProducts =

    Array.isArray(
      runtime?.related_products
    )

      ? runtime.related_products

      : []

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

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

      relatedProducts:
        relatedProducts.length,
    }
  )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <div className="space-y-6">

      {/* ============================================================= */}
      {/* Traversal Runtime */}
      {/* ============================================================= */}

      <TraversalRuntimeInspector

        runtime={runtime}

      />

      {/* ============================================================= */}
      {/* Continuation Runtime */}
      {/* ============================================================= */}

      <TraversalContinuityInspector

        runtime={runtime}

      />

      {/* ============================================================= */}
      {/* Traversal Graph */}
      {/* ============================================================= */}

      <TraversalGraphInspector

        runtime={runtime}

      />

      {/* ============================================================= */}
      {/* Traversal Edges */}
      {/* ============================================================= */}

      <TraversalEdgeInspector

        runtime={runtime}

      />

    </div>
  )
}

