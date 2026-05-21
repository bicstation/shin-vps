// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/traversal/TraversalEdgeInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Traversal Edge Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Traversal edge observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * semantic traversal edge visualization
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

type TraversalEdgeInspectorProps = {

  traversal_edges?: any[]
}

/* ============================================================================
🔥 Traversal Edge Card
============================================================================ */

function TraversalEdgeCard({

  edge,

  index,

}: {

  edge: any

  index: number

}) {

  /* ==========================================================================
  🔥 Edge Metadata
  ========================================================================== */

  const source =

    edge?.source
    || edge?.from
    || '-'

  const target =

    edge?.target
    || edge?.to
    || '-'

  const relation =

    edge?.relation
    || edge?.type
    || '-'

  const score =

    edge?.score
    || edge?.weight
    || '-'

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className="rounded-2xl border border-zinc-800 bg-black p-5">

      <div className="flex items-center justify-between gap-4">

        <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">

          Edge #{index + 1}

        </div>

        <RuntimeBadge

          label="relation"

          value={relation}

          variant="topology"

        />

      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">

        <InspectorCard

          title="Source"

          value={source}

        />

        <InspectorCard

          title="Target"

          value={target}

        />

      </div>

      <div className="mt-4">

        <InspectorCard

          title="Traversal Score"

          value={score}

        />

      </div>

    </div>
  )
}

/* ============================================================================
🔥 Traversal Edge Inspector
============================================================================ */

export default function TraversalEdgeInspector({

  traversal_edges,

}: TraversalEdgeInspectorProps) {

  /* ==========================================================================
  🔥 Traversal Edges
  ========================================================================== */

  const traversalEdges =

    Array.isArray(
      traversal_edges
    )

      ? traversal_edges

      : []

  /* ==========================================================================
  🔥 Runtime Status
  ========================================================================== */

  const hasEdges =

    traversalEdges.length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🔗 TRAVERSAL EDGE INSPECTOR',

    {

      edges:

        traversalEdges.length,

      hasEdges,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🔗 Traversal Edge Inspector"

      description="Semantic traversal edge observability and traversal graph relationship visualization."

      badge="runtime/traversal-edges"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="edges"

          value={
            String(
              traversalEdges.length
            )
          }

          variant={
            hasEdges
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="graph"

          value={
            hasEdges
              ? 'connected'
              : 'empty'
          }

          variant="topology"

        />

      </div>

      {/* ================================================================
      🔥 Edge Summary
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-3">

        <InspectorCard

          title="Total Edges"

          value={traversalEdges.length}

        />

        <InspectorCard

          title="Traversal Runtime"

          value={
            hasEdges
              ? 'active'
              : 'inactive'
          }

        />

        <InspectorCard

          title="Graph Connectivity"

          value={
            hasEdges
              ? 'connected'
              : 'disconnected'
          }

        />

      </div>

      {/* ================================================================
      🔥 Traversal Edges
      ================================================================ */}

      {

        hasEdges

          ? (

              <div className="space-y-6">

                {

                  traversalEdges.map(

                    (

                      edge: any,

                      index: number

                    ) => (

                      <TraversalEdgeCard

                        key={index}

                        edge={edge}

                        index={index}

                      />

                    )
                  )
                }

              </div>
            )

          : (

              <div className="rounded-2xl border border-zinc-800 bg-black p-6 text-sm text-zinc-500">

                No traversal edges detected.

              </div>
            )
      }

      {/* ================================================================
      🔥 Raw Traversal Edges
      ================================================================ */}

      <RawJsonInspector

        title="Raw Traversal Edges"

        description="Raw traversal edge authority payload observability."

        badge="runtime/traversal-edges-raw"

        payload={traversalEdges}

      />

    </InspectorSection>
  )
}