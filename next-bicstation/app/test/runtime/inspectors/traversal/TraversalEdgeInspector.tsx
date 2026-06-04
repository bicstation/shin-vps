// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/traversal/TraversalEdgeInspector.tsx
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

type TraversalEdgeInspectorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Traversal Edge Inspector
============================================================================ */

/**
 * Traversal edge observatory inspector.
 *
 * Responsibilities:
 *
 * - traversal edge continuity inspection
 * - semantic edge observability
 * - workflow continuity visualization
 * - traversal runtime edge introspection
 *
 * IMPORTANT:
 *
 * Frontend remains observability authority only.
 *
 * Backend remains semantic authority.
 */
export default function TraversalEdgeInspector({

  runtime,

}: TraversalEdgeInspectorProps) {

  // ==========================================================================
  // Canonical Traversal Edges
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
  // Empty State
  // ==========================================================================

  if (
    traversalEdges.length === 0
  ) {

    return (

      <InspectorSection

        title="Traversal Edge Runtime"

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

          No semantic traversal edges available.

        </div>

      </InspectorSection>
    )
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <InspectorSection

      title="Traversal Edge Runtime"

      badge={`${traversalEdges.length} EDGES`}
    >

      <div
        className="
          grid
          gap-4
        "
      >

        {
          traversalEdges.map(
            (
              edge: any,
              index: number,
            ) => (

              <InspectorCard

                key={index}

                title={
                  edge?.edge_type
                  || 'unknown-edge'
                }

                badge={
                  edge?.workflow_relation
                  || 'runtime-edge'
                }
              >

                <div
                  className="
                    space-y-3
                    text-sm
                  "
                >

                  {/* ======================================================
                  Edge Type
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

                      Edge Type

                    </div>

                    <div
                      className="
                        text-zinc-200
                      "
                    >

                      {
                        edge?.edge_type
                        || 'unknown'
                      }

                    </div>

                  </div>

                  {/* ======================================================
                  Workflow Relation
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

                      Workflow Relation

                    </div>

                    <div
                      className="
                        text-zinc-200
                      "
                    >

                      {
                        edge?.workflow_relation
                        || 'unknown'
                      }

                    </div>

                  </div>

                  {/* ======================================================
                  Similarity Score
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

                      Similarity Score

                    </div>

                    <div
                      className="
                        text-zinc-200
                      "
                    >

                      {
                        edge?.similarity_score
                        ?? 0
                      }

                    </div>

                  </div>

                  {/* ======================================================
                  Runtime Reason
                  ====================================================== */}

                  {

                    edge?.reason && (

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

                          Runtime Reason

                        </div>

                        <div
                          className="
                            text-zinc-300
                          "
                        >

                          {
                            edge.reason
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