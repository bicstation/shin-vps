// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/orchestrators/EntityInspectorOrchestrator.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Entity Inspector Orchestrator
 * ============================================================================
 *
 * PURPOSE:
 *
 * Semantic entity runtime observability orchestration
 *
 * IMPORTANT:
 *
 * This orchestrator exists for:
 *
 * entity-runtime inspector composition
 *
 * NOT:
 *
 * payload normalization
 * semantic mutation
 * runtime transformation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Entity Inspectors
============================================================================ */

import EntityRuntimeInspector
from '../semantic/entity/EntityRuntimeInspector'

import EntityWorkflowInspector
from '../semantic/entity/EntityWorkflowInspector'

import EntityAdaptiveInspector
from '../semantic/entity/EntityAdaptiveInspector'

import EntitySemanticLabels
from '../semantic/entity/EntitySemanticLabels'

/* ============================================================================
🔥 Graph Inspector
============================================================================ */

import SemanticGraphInspector
from '../semantic/SemanticGraphInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type EntityInspectorOrchestratorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Entity Inspector Orchestrator
============================================================================ */

export default function EntityInspectorOrchestrator({

  runtime,

}: EntityInspectorOrchestratorProps) {

  /* ==========================================================================
  🔥 Payload
  ========================================================================== */

  const payload =

    runtime?.payload
    || {}

  /* ==========================================================================
  🔥 Semantic Runtime
  ========================================================================== */

  const semanticRuntime =

    payload?.semantic_runtime
    || {}

  /* ==========================================================================
  🔥 Adaptive Runtime
  ========================================================================== */

  const adaptiveRuntime =

    payload?.adaptive_runtime
    || {}

  /* ==========================================================================
  🔥 Semantic Labels
  ========================================================================== */

  const semanticLabels =

    Array.isArray(
      payload?.semantic_labels
    )

      ? payload.semantic_labels

      : []

  /* ==========================================================================
  🔥 Semantic Graph
  ========================================================================== */

  const semanticGraph =

    Array.isArray(
      payload?.semantic_graph
    )

      ? payload.semantic_graph

      : []

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🧠 ENTITY INSPECTOR ORCHESTRATOR',

    {

      runtimeRole:

        runtime?.runtime_role,

      topologyLayer:

        runtime?.topology_layer,

      endpoint:

        runtime?.endpoint,

      hasSemanticRuntime:

        !!payload?.semantic_runtime,

      hasAdaptiveRuntime:

        !!payload?.adaptive_runtime,

      semanticLabels:

        semanticLabels.length,

      semanticGraph:

        semanticGraph.length,
    }
  )

  /* ==========================================================================
  🔥 Observatory Stack
  ========================================================================== */

  return (

    <div className="space-y-8">

      {/* ================================================================
      🔥 Entity Runtime
      ================================================================ */}

      <EntityRuntimeInspector

        semantic_runtime={
          semanticRuntime
        }

        semantic_metadata={
          payload
        }

      />

      {/* ================================================================
      🔥 Workflow Runtime
      ================================================================ */}

      <EntityWorkflowInspector

        semantic_runtime={
          semanticRuntime
        }

      />

      {/* ================================================================
      🔥 Adaptive Runtime
      ================================================================ */}

      <EntityAdaptiveInspector

        adaptive_runtime={
          adaptiveRuntime
        }

      />

      {/* ================================================================
      🔥 Semantic Labels
      ================================================================ */}

      <EntitySemanticLabels

        semantic_labels={
          semanticLabels
        }

      />

      {/* ================================================================
      🔥 Semantic Graph
      ================================================================ */}

      <SemanticGraphInspector

        semantic_graph={
          semanticGraph
        }

      />

    </div>
  )
}