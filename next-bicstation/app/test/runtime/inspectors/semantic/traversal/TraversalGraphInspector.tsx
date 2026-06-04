// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/traversal/TraversalGraphInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Components
============================================================================ */

import InspectorCard
from '../shared/InspectorCard'

import InspectorSection
from '../shared/InspectorSection'

/* ============================================================================
🔥 Types
============================================================================ */

type TraversalGraphInspectorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Traversal Graph Inspector
============================================================================ */

/**
 * Traversal graph observatory inspector.
 *
 * Responsibilities:
 *
 * - semantic traversal graph visualization
 * - workflow topology inspection
 * - graph continuity observability
 * - traversal runtime topology introspection
 *
 * IMPORTANT:
 *
 * Frontend remains observability authority only.
 *
 * Backend remains semantic authority.
 */
export default function TraversalGraphInspector({

  runtime,

}: TraversalGraphInspectorProps) {

  // ==========================================================================
  // Canonical Traversal Graph
  // ==========================================================================

  const traversalGraph =

    Array.isArray(
      runtime?.traversal_graph
    )

      ? runtime.traversal_graph

      : []

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🛰 TRAVERSAL GRAPH INSPECTOR',

    {

      traversalGraph,
    }
  )

  // ==========================================================================
  // Empty State
  // ==========================================================================

  if (
    traversalGraph.length === 0
  ) {

    return (

      <InspectorSection

        title="Traversal Graph Runtime"

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

          No semantic traversal graph available.

        </div>

      </InspectorSection>
    )
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <InspectorSection

      title="Traversal Graph Runtime"

      badge={`${traversalGraph.length} NODES`}
    >

      <div
        className="
          grid
          gap-4
        "
      >

        {
          traversalGraph.map(
            (
              node: any,
              index: number,
            ) => (

              <InspectorCard

                key={index}

                title={
                  node?.node_type
                  || node?.semantic_role
                  || 'graph-node'
                }

                badge={
                  node?.workflow
                  || node?.workflow_role
                  || 'runtime-node'
                }
              >

                <div
                  className="
                    space-y-3
                    text-sm
                  "
                >

                  {/* ======================================================
                  Node Type
                  ====================================================== */}

                  <div>

                    <div
                      className="
                        mb-1
                        text-xs
                        uppercase
                        tracking-widest
                        text-zinc-500
                      "
                    >

                      Node Type

                    </div>

                    <div
                      className="
                        text-zinc-200
                      "
                    >

                      {
                        node?.node_type
                        || 'unknown'
                      }

                    </div>

                  </div>

                  {/* ======================================================
                  Workflow Role
                  ====================================================== */}

                  <div>

                    <div
                      className="
                        mb-1
                        text-xs
                        uppercase
                        tracking-widest
                        text-zinc-500
                      "
                    >

                      Workflow Role

                    </div>

                    <div
                      className="
                        text-zinc-200
                      "
                    >

                      {
                        node?.workflow_role
                        || node?.workflow
                        || 'unknown'
                      }

                    </div>

                  </div>

                  {/* ======================================================
                  Semantic Role
                  ====================================================== */}

                  {

                    node?.semantic_role && (

                      <div>

                        <div
                          className="
                            mb-1
                            text-xs
                            uppercase
                            tracking-widest
                            text-zinc-500
                          "
                        >

                          Semantic Role

                        </div>

                        <div
                          className="
                            text-zinc-300
                          "
                        >

                          {
                            node.semantic_role
                          }

                        </div>

                      </div>
                    )
                  }

                  {/* ======================================================
                  Workflow Tags
                  ====================================================== */}

                  {

                    Array.isArray(
                      node?.workflow_tags
                    )

                    &&

                    node.workflow_tags.length > 0 && (

                      <div>

                        <div
                          className="
                            mb-2
                            text-xs
                            uppercase
                            tracking-widest
                            text-zinc-500
                          "
                        >

                          Workflow Tags

                        </div>

                        <div
                          className="
                            flex
                            flex-wrap
                            gap-2
                          "
                        >

                          {
                            node.workflow_tags.map(
                              (
                                tag: string,
                                tagIndex: number,
                              ) => (

                                <div
                                  key={tagIndex}

                                  className="
                                    rounded-full
                                    border
                                    border-zinc-800
                                    bg-zinc-900
                                    px-3
                                    py-1
                                    text-xs
                                    text-zinc-300
                                  "
                                >

                                  {tag}

                                </div>
                              )
                            )
                          }

                        </div>

                      </div>
                    )
                  }

                </div>

              </InspectorCard>
            )
          )
        }

      </div>

    </InspectorSection>
  )
}