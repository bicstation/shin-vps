// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/traversal/TraversalGraphInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorCard from '../shared/InspectorCard'

import InspectorSection from '../shared/InspectorSection'

import RuntimeBadge from '../shared/RuntimeBadge'

/* ============================================================================
🔥 Types
============================================================================ */

type TraversalGraphInspectorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Traversal Graph Inspector
============================================================================ */

export default function TraversalGraphInspector({

  runtime,

}: TraversalGraphInspectorProps) {

  // ==========================================================================
  // Payload
  // ==========================================================================

  const payload =

    runtime?.payload || {}

  // ==========================================================================
  // Traversal Graph
  // ==========================================================================

  const traversalGraph =

    Array.isArray(
      payload?.traversal_graph
    )

      ? payload.traversal_graph

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
  // Render
  // ==========================================================================

  return (

    <InspectorCard>

      <InspectorSection

        title="🛰 Traversal Graph Runtime"

        badge={

          <RuntimeBadge>

            runtime/graph

          </RuntimeBadge>
        }
      >

        <div className="space-y-4 text-sm">

          {/* ============================================================= */}
          {/* Empty */}
          {/* ============================================================= */}

          {

            traversalGraph.length === 0 && (

              <div className="text-xs opacity-60">

                No traversal graph topology detected

              </div>
            )
          }

          {/* ============================================================= */}
          {/* Graph Nodes */}
          {/* ============================================================= */}

          {

            traversalGraph.map(

              (
                node: any,
                index: number
              ) => (

                <div

                  key={index}

                  className="
                    border
                    rounded-lg
                    p-4
                    space-y-3
                  "
                >

                  {/* =================================================== */}
                  {/* Node Header */}
                  {/* =================================================== */}

                  <div className="font-semibold">

                    Graph Node #{index + 1}

                  </div>

                  {/* =================================================== */}
                  {/* Node Fields */}
                  {/* =================================================== */}

                  <div className="grid grid-cols-2 gap-2">

                    <div className="opacity-70">

                      Node ID

                    </div>

                    <div>

                      {

                        node?.id
                        || '-'
                      }

                    </div>

                    <div className="opacity-70">

                      Product Type

                    </div>

                    <div>

                      {

                        node?.type
                        || '-'
                      }

                    </div>

                    <div className="opacity-70">

                      Semantic Score

                    </div>

                    <div>

                      {

                        node?.semantic_score
                        ?? '-'
                      }

                    </div>

                    <div className="opacity-70">

                      Edge Type

                    </div>

                    <div>

                      {

                        node?.edge_type
                        || '-'
                      }

                    </div>

                    <div className="opacity-70">

                      Workflow Relation

                    </div>

                    <div>

                      {

                        node?.workflow_relation
                        || '-'
                      }

                    </div>

                  </div>

                </div>
              )
            )
          }

          {/* ============================================================= */}
          {/* Runtime Meaning */}
          {/* ============================================================= */}

          <div>

            <div className="font-semibold mb-2">

              Runtime Meaning

            </div>

            <div className="space-y-2 text-xs opacity-80">

              <div>

                🛰 Traversal graph runtime represents
                semantic continuation topology

              </div>

              <div>

                🔗 Graph nodes preserve
                semantic traversal structure

              </div>

              <div>

                ♾ Workflow relations represent
                continuity-aware graph traversal

              </div>

              <div>

                ❌ Frontend graph mutation prohibited

              </div>

            </div>

          </div>

        </div>

      </InspectorSection>

    </InspectorCard>
  )
}

