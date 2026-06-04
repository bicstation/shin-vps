// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/traversal/ContinuationInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Components
============================================================================ */

import InspectorCard
from '../semantic/shared/InspectorCard'

import InspectorSection
from '../semantic/shared/InspectorSection'

/* ============================================================================
🔥 Types
============================================================================ */

type ContinuationInspectorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Continuation Inspector
============================================================================ */

/**
 * Continuation runtime observatory inspector.
 *
 * Responsibilities:
 *
 * - workflow continuity inspection
 * - semantic continuity observability
 * - graph continuity verification
 * - continuation runtime introspection
 *
 * IMPORTANT:
 *
 * Frontend remains observability authority only.
 *
 * Backend remains semantic authority.
 */
export default function ContinuationInspector({

  runtime,

}: ContinuationInspectorProps) {

  // ==========================================================================
  // Canonical Continuation Runtime
  // ==========================================================================

  const continuationRuntime =

    runtime?.workflow_runtime

    || runtime?.continuation_runtime

    || {}

  // ==========================================================================
  // Runtime Flags
  // ==========================================================================

  const workflowContinuity =

    continuationRuntime
      ?.workflow_continuity

  const semanticContinuity =

    continuationRuntime
      ?.semantic_continuity

  const graphContinuity =

    continuationRuntime
      ?.graph_continuity

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '♾ TRAVERSAL CONTINUITY INSPECTOR',

    {

      workflowContinuity,

      semanticContinuity,

      graphContinuity,
    }
  )

  // ==========================================================================
  // Empty State
  // ==========================================================================

  if (
    !workflowContinuity
    &&
    !semanticContinuity
    &&
    !graphContinuity
  ) {

    return (

      <InspectorSection

        title="Continuation Runtime"

        badge="EMPTY"
      >

        <div
          className="
            rounded-3xl
            border
            border-zinc-900
            bg-zinc-950/40
            p-6
            text-sm
            text-zinc-500
          "
        >

          No continuation runtime available.

        </div>

      </InspectorSection>
    )
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <InspectorSection

      title="Continuation Runtime"

      badge="ACTIVE"
    >

      <div
        className="
          grid
          gap-4
          md:grid-cols-3
        "
      >

        {/* ==============================================================
        Workflow Continuity
        ============================================================== */}

        <InspectorCard

          title="Workflow Continuity"

          badge={
            workflowContinuity
              ? 'TRUE'
              : 'FALSE'
          }
        >

          <div
            className="
              text-sm
              text-zinc-300
            "
          >

            Workflow traversal continuity
            across semantic runtime graph.

          </div>

        </InspectorCard>

        {/* ==============================================================
        Semantic Continuity
        ============================================================== */}

        <InspectorCard

          title="Semantic Continuity"

          badge={
            semanticContinuity
              ? 'TRUE'
              : 'FALSE'
          }
        >

          <div
            className="
              text-sm
              text-zinc-300
            "
          >

            Semantic meaning continuity
            preserved across traversal runtime.

          </div>

        </InspectorCard>

        {/* ==============================================================
        Graph Continuity
        ============================================================== */}

        <InspectorCard

          title="Graph Continuity"

          badge={
            graphContinuity
              ? 'TRUE'
              : 'FALSE'
          }
        >

          <div
            className="
              text-sm
              text-zinc-300
            "
          >

            Traversal graph continuity
            active across runtime topology.

          </div>

        </InspectorCard>

      </div>

    </InspectorSection>
  )
}