// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/entity/EntityRuntimeInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Entity Runtime Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Semantic entity runtime observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * entity semantic runtime visualization
 *
 * NOT:
 *
 * semantic mutation
 * runtime normalization
 * authority transformation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorSection
from '../shared/InspectorSection'

import InspectorCard
from '../shared/InspectorCard'

import RuntimeBadge
from '../shared/RuntimeBadge'

import RawJsonInspector
from '../shared/RawJsonInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type EntityRuntimeInspectorProps = {

  semantic_runtime?: any

  semantic_metadata?: any
}

/* ============================================================================
🔥 Entity Runtime Inspector
============================================================================ */

export default function EntityRuntimeInspector({

  semantic_runtime,

  semantic_metadata,

}: EntityRuntimeInspectorProps) {

  /* ==========================================================================
  🔥 Raw Runtime
  ========================================================================== */

  const rawSemanticRuntime =

    semantic_runtime

  /* ==========================================================================
  🔥 Safe Runtime
  ========================================================================== */

  const semanticRuntime =

    typeof semantic_runtime === 'object'
      && semantic_runtime !== null

        ? semantic_runtime

        : {}

  /* ==========================================================================
  🔥 Metadata
  ========================================================================== */

  const metadata =

    semantic_metadata || {}

  /* ==========================================================================
  🔥 Runtime Version
  ========================================================================== */

  const semanticRuntimeVersion =

    typeof semantic_runtime === 'string'

      ? semantic_runtime

      : (
          semanticRuntime?.semantic_version
          || metadata?.semantic_schema_version
          || '-'
        )

  /* ==========================================================================
  🔥 Runtime Fields
  ========================================================================== */

  const semanticRole =

    semanticRuntime?.semantic_role
    || '-'

  const semanticGroup =

    semanticRuntime?.semantic_group
    || '-'

  const semanticScore =

    semanticRuntime?.semantic_score
    || metadata?.semantic_score
    || '-'

  const semanticConfidence =

    semanticRuntime?.confidence
    || metadata?.confidence
    || '-'

  /* ==========================================================================
  🔥 Workflow Tags
  ========================================================================== */

  const workflowTags =

    Array.isArray(
      semanticRuntime?.workflow_tags
    )

      ? semanticRuntime.workflow_tags

      : []

  /* ==========================================================================
  🔥 Semantic Graph
  ========================================================================== */

  const semanticGraph =

    Array.isArray(
      semanticRuntime?.semantic_graph
    )

      ? semanticRuntime.semantic_graph

      : []

  /* ==========================================================================
  🔥 Runtime Status
  ========================================================================== */

  const runtimeActive =

    Object.keys(
      semanticRuntime
    ).length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🧠 ENTITY RUNTIME INSPECTOR',

    {

      runtimeActive,

      semanticRuntimeVersion,

      semanticRole,

      semanticGroup,

      workflowTags:

        workflowTags.length,

      semanticGraph:

        semanticGraph.length,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🧠 Entity Runtime Inspector"

      description="Semantic entity runtime observability and semantic authority visualization."

      badge="runtime/entity"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="runtime"

          value={
            runtimeActive
              ? 'active'
              : 'inactive'
          }

          variant={
            runtimeActive
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="semantic"

          value={semanticRole}

          variant="semantic"

        />

        <RuntimeBadge

          label="schema"

          value={
            String(
              semanticRuntimeVersion
            )
          }

          variant="topology"

        />

      </div>

      {/* ================================================================
      🔥 Runtime Grid
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        <InspectorCard

          title="Semantic Role"

          value={semanticRole}

        />

        <InspectorCard

          title="Semantic Group"

          value={semanticGroup}

        />

        <InspectorCard

          title="Semantic Score"

          value={semanticScore}

        />

        <InspectorCard

          title="Semantic Confidence"

          value={semanticConfidence}

        />

        <InspectorCard

          title="Workflow Tags"

          value={workflowTags.length}

        />

        <InspectorCard

          title="Graph Edges"

          value={semanticGraph.length}

        />

      </div>

      {/* ================================================================
      🔥 Workflow Tags
      ================================================================ */}

      <InspectorCard

        title="Workflow Tags"

        value={workflowTags}

        mono

        badge="runtime/workflows"

        description="Traversal-safe semantic workflow grouping and runtime orchestration tags."

      />

      {/* ================================================================
      🔥 Semantic Graph
      ================================================================ */}

      <InspectorCard

        title="Semantic Graph"

        value={semanticGraph}

        mono

        badge="runtime/semantic-graph"

        description="Semantic graph observability and semantic runtime relationship topology."

      />

      {/* ================================================================
      🔥 Raw Semantic Runtime
      ================================================================ */}

      <RawJsonInspector

        title="Raw Semantic Runtime"

        description="Raw semantic runtime authority payload observability."

        badge="runtime/semantic-raw"

        payload={rawSemanticRuntime}

      />

    </InspectorSection>
  )
}