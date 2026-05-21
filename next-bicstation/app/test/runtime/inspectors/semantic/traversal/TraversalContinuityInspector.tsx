// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/traversal/TraversalContinuityInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Traversal Continuity Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Traversal continuity observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * semantic traversal continuity visualization
 *
 * NOT:
 *
 * graph mutation
 * traversal rewriting
 * semantic normalization
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

type TraversalContinuityInspectorProps = {

  continuation_runtime?: any
}

/* ============================================================================
🔥 Traversal Continuity Inspector
============================================================================ */

export default function TraversalContinuityInspector({

  continuation_runtime,

}: TraversalContinuityInspectorProps) {

  /* ==========================================================================
  🔥 Continuation Runtime
  ========================================================================== */

  const continuationRuntime =

    continuation_runtime || {}

  /* ==========================================================================
  🔥 Continuity Metadata
  ========================================================================== */

  const continuationMode =

    continuationRuntime?.mode
    || '-'

  const continuationRole =

    continuationRuntime?.role
    || '-'

  const traversalDepth =

    continuationRuntime?.depth
    || 0

  const traversalConfidence =

    continuationRuntime?.confidence
    || '-'

  const continuityScore =

    continuationRuntime?.continuity_score
    || '-'

  /* ==========================================================================
  🔥 Runtime Status
  ========================================================================== */

  const continuityActive =

    Object.keys(
      continuationRuntime
    ).length > 0

  /* ==========================================================================
  🔥 Traversal Paths
  ========================================================================== */

  const traversalPaths =

    Array.isArray(
      continuationRuntime?.paths
    )

      ? continuationRuntime.paths

      : []

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🛰️ TRAVERSAL CONTINUITY INSPECTOR',

    {

      continuationMode,

      continuationRole,

      traversalDepth,

      traversalConfidence,

      continuityScore,

      traversalPaths:

        traversalPaths.length,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🛰️ Traversal Continuity Inspector"

      description="Semantic traversal continuity observability and traversal runtime continuity visualization."

      badge="runtime/traversal-continuity"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="continuity"

          value={
            continuityActive
              ? 'active'
              : 'inactive'
          }

          variant={
            continuityActive
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="mode"

          value={continuationMode}

          variant="topology"

        />

        <RuntimeBadge

          label="role"

          value={continuationRole}

          variant="semantic"

        />

      </div>

      {/* ================================================================
      🔥 Continuity Grid
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

        <InspectorCard

          title="Continuation Mode"

          value={continuationMode}

        />

        <InspectorCard

          title="Continuation Role"

          value={continuationRole}

        />

        <InspectorCard

          title="Traversal Depth"

          value={traversalDepth}

        />

        <InspectorCard

          title="Traversal Confidence"

          value={traversalConfidence}

        />

        <InspectorCard

          title="Continuity Score"

          value={continuityScore}

        />

      </div>

      {/* ================================================================
      🔥 Traversal Paths
      ================================================================ */}

      <InspectorCard

        title="Traversal Paths"

        value={traversalPaths}

        mono

        badge="runtime/traversal-paths"

        description="Semantic traversal continuity paths and traversal-safe orchestration topology."

      />

      {/* ================================================================
      🔥 Raw Continuation Runtime
      ================================================================ */}

      <RawJsonInspector

        title="Raw Continuation Runtime"

        description="Raw continuation runtime authority payload observability."

        badge="runtime/continuation-raw"

        payload={continuationRuntime}

      />

    </InspectorSection>
  )
}