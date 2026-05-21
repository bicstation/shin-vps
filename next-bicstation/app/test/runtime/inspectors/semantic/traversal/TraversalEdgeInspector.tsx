// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/traversal/TraversalEdgeInspector.tsx
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

type TraversalEdgeInspectorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Traversal Edge Inspector
============================================================================ */

export default function TraversalEdgeInspector({

  runtime,

}: TraversalEdgeInspectorProps) {

  // ==========================================================================
  // Traversal Edges
  // ==========================================================================

  const traversalEdges =

    Array.isArray(
      runtime?.traversal_edges
    )

      ? runtime.traversal_edges

      : []

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🔗 TRAVERSAL EDGE INSPECTOR',

    {

      traversalEdges,
    }
  )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <InspectorCard>

      <InspectorSection

        title="🔗 Traversal Edge Runtime"

        badge={

          <RuntimeBadge>

            runtime/edges

          </RuntimeBadge>
        }
      >

        <div className="space-y-4 text-sm">

          {/* ============================================================= */}
          {/* Empty */}
          {/* ============================================================= */}

          {

            traversalEdges.length === 0 && (

              <div className="text-xs opacity-60">

                No traversal edges detected

              </div>
            )
          }

          {/* ============================================================= */}
          {/* Edges */}
          {/* ============================================================= */}

          {

            traversalEdges.map(

              (
                edge: any,
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
                  {/* Edge Header */}
                  {/* =================================================== */}

                  <div className="font-semibold">

                    Edge #{index + 1}

                  </div>

                  {/* =================================================== */}
                  {/* Edge Fields */}
                  {/* =================================================== */}

                  <div className="grid grid-cols-2 gap-2">

                    <div className="opacity-70">

                      Edge Type

                    </div>

                    <div>

                      {

                        edge?.edge_type
                        || '-'
                      }

                    </div>

                    <div className="opacity-70">

                      Workflow Relation

                    </div>

                    <div>

                      {

                        edge?.workflow_relation
                        || '-'
                      }

                    </div>

                    <div className="opacity-70">

                      Similarity Score

                    </div>

                    <div>

                      {

                        edge?.similarity_score
                        ?? '-'
                      }

                    </div>

                    <div className="opacity-70">

                      Reason

                    </div>

                    <div>

                      {

                        edge?.reason
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

                🔗 Edge runtime represents
                semantic continuation topology

              </div>

              <div>

                ♾ Workflow relations represent
                continuation authority between entities

              </div>

              <div>

                🛰 Traversal edges preserve
                semantic graph continuity

              </div>

              <div>

                ❌ Frontend edge mutation prohibited

              </div>

            </div>

          </div>

        </div>

      </InspectorSection>

    </InspectorCard>
  )
}

