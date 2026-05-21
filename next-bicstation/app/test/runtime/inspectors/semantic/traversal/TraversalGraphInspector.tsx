// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/traversal/TraversalGraphInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Traversal Graph Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Traversal graph observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * semantic traversal graph visualization
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

type TraversalGraphInspectorProps = {

  traversal_graph?: any[]
}

/* ============================================================================
🔥 Traversal Node Card
============================================================================ */

function TraversalNodeCard({

  node,

  index,

}: {

  node: any

  index: number

}) {

  /* ==========================================================================
  🔥 Node Metadata
  ========================================================================== */

  const nodeId =

    node?.id
    || node?.node_id
    || `node-${index + 1}`

  const nodeType =

    node?.type
    || node?.node_type
    || '-'

  const nodeRole =

    node?.role
    || node?.semantic_role
    || '-'

  const nodeScore =

    node?.score
    || node?.semantic_score
    || '-'

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className="rounded-2xl border border-zinc-800 bg-black p-5">

      <div className="flex items-center justify-between gap-4">

        <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">

          Traversal Node

        </div>

        <RuntimeBadge

          label="type"

          value={nodeType}

          variant="topology"

        />

      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">

        <InspectorCard

          title="Node ID"

          value={nodeId}

        />

        <InspectorCard

          title="Node Role"

          value={nodeRole}

        />

      </div>

      <div className="mt-4">

        <InspectorCard

          title="Semantic Score"

          value={nodeScore}

        />

      </div>

    </div>
  )
}

/* ============================================================================
🔥 Traversal Graph Inspector
============================================================================ */

export default function TraversalGraphInspector({

  traversal_graph,

}: TraversalGraphInspectorProps) {

  /* ==========================================================================
  🔥 Traversal Graph
  ========================================================================== */

  const traversalGraph =

    Array.isArray(
      traversal_graph
    )

      ? traversal_graph

      : []

  /* ==========================================================================
  🔥 Runtime Status
  ========================================================================== */

  const hasGraph =

    traversalGraph.length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🌌 TRAVERSAL GRAPH INSPECTOR',

    {

      nodes:

        traversalGraph.length,

      hasGraph,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🌌 Traversal Graph Inspector"

      description="Semantic traversal graph observability and graph topology visualization."

      badge="runtime/traversal-graph"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="graph"

          value={
            hasGraph
              ? 'active'
              : 'inactive'
          }

          variant={
            hasGraph
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="nodes"

          value={
            String(
              traversalGraph.length
            )
          }

          variant="topology"

        />

      </div>

      {/* ================================================================
      🔥 Graph Summary
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-3">

        <InspectorCard

          title="Total Nodes"

          value={traversalGraph.length}

        />

        <InspectorCard

          title="Graph Runtime"

          value={
            hasGraph
              ? 'active'
              : 'inactive'
          }

        />

        <InspectorCard

          title="Topology State"

          value={
            hasGraph
              ? 'connected'
              : 'empty'
          }

        />

      </div>

      {/* ================================================================
      🔥 Traversal Graph Nodes
      ================================================================ */}

      {

        hasGraph

          ? (

              <div className="space-y-6">

                {

                  traversalGraph.map(

                    (

                      node: any,

                      index: number

                    ) => (

                      <TraversalNodeCard

                        key={index}

                        node={node}

                        index={index}

                      />

                    )
                  )
                }

              </div>
            )

          : (

              <div className="rounded-2xl border border-zinc-800 bg-black p-6 text-sm text-zinc-500">

                No traversal graph nodes detected.

              </div>
            )
      }

      {/* ================================================================
      🔥 Raw Traversal Graph
      ================================================================ */}

      <RawJsonInspector

        title="Raw Traversal Graph"

        description="Raw traversal graph authority payload observability."

        badge="runtime/traversal-graph-raw"

        payload={traversalGraph}

      />

    </InspectorSection>
  )
}