// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/TraversalEdgeInspector.tsx
// ============================================================================

'use client'

/**
 * SHIN CORE LINX
 * Traversal Edge Inspector
 *
 * IMPORTANT:
 * This component represents:
 *
 * semantic traversal graph observability
 *
 * NOT:
 *
 * traversal authority
 *
 * Backend remains:
 *
 * - traversal authority
 * - continuation authority
 * - graph authority
 * - workflow authority
 *
 * Responsibilities:
 * - traversal edge visualization
 * - continuation observability
 * - workflow relation observability
 * - semantic graph rendering
 *
 * IMPORTANT:
 * This component MUST NOT:
 *
 * ❌ infer traversal meaning
 * ❌ generate continuation logic
 * ❌ rewrite workflow transitions
 * ❌ mutate graph relationships
 */

/* ============================================================================
🔥 Imports
============================================================================ */

import type {

  TraversalInspectorProps,

  SemanticRelatedNode,

  TraversalEdge,

} from '../contracts/traversal'

/* ============================================================================
🔥 Inspector Card
============================================================================ */

function InspectorCard({

  title,

  value,

}: {

  title: string

  value: any

}) {

  return (

    <div className="rounded-lg border border-zinc-800 bg-black p-4">

      <div className="text-xs uppercase tracking-wide text-zinc-500">

        {title}

      </div>

      <div className="mt-2 break-all text-sm text-zinc-100">

        {

          typeof value === 'boolean'

            ? (

                value
                  ? 'TRUE'
                  : 'FALSE'
              )

            : (

                String(
                  value ?? '-'
                )
              )
        }

      </div>

    </div>
  )
}

/* ============================================================================
🔥 Traversal Edge Badge
============================================================================ */

function EdgeBadge({

  value,

}: {

  value?: string | null

}) {

  if (!value) {

    return null
  }

  return (

    <div className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-300">

      {value}

    </div>
  )
}

/* ============================================================================
🔥 Traversal Edge Node
============================================================================ */

function TraversalNode({

  node,

  index,

}: {

  node: SemanticRelatedNode

  index: number

}) {

  const edge:

    TraversalEdge | undefined =

      node?.edge

  return (

    <div className="rounded-xl border border-zinc-800 bg-black p-5">

      {/* ================================================================
      🔥 Node Header
      ================================================================ */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <div className="text-xs uppercase tracking-wide text-zinc-500">

            Continuation Node

          </div>

          <h3 className="mt-2 text-base font-bold text-zinc-100">

            {

              node?.title
              || node?.unique_id
              || `node-${index}`
            }

          </h3>

          <div className="mt-2 text-xs text-zinc-500">

            {

              node?.unique_id
              || 'unknown-node'
            }

          </div>

        </div>

        <div className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">

          edge-{index + 1}

        </div>

      </div>

      {/* ================================================================
      🔥 Traversal Grid
      ================================================================ */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

        <InspectorCard

          title="Edge Type"

          value={
            edge?.edge_type
          }

        />

        <InspectorCard

          title="Workflow Relation"

          value={
            edge?.workflow_relation
          }

        />

        <InspectorCard

          title="Similarity Score"

          value={
            edge?.similarity_score
          }

        />

        <InspectorCard

          title="Semantic Score"

          value={
            edge?.semantic_score
          }

        />

        <InspectorCard

          title="Traversal Depth"

          value={
            edge?.traversal_depth
          }

        />

        <InspectorCard

          title="Shallow Payload"

          value={
            edge?.shallow_payload
          }

        />

      </div>

      {/* ================================================================
      🔥 Continuity Hint
      ================================================================ */}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

        <div className="text-xs uppercase tracking-wide text-zinc-500">

          Continuity Hint

        </div>

        <div className="mt-3 text-sm leading-relaxed text-zinc-300">

          {

            edge?.continuity_hint
            || 'No continuity hint'
          }

        </div>

      </div>

      {/* ================================================================
      🔥 Workflow Tags
      ================================================================ */}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

        <div className="text-xs uppercase tracking-wide text-zinc-500">

          Workflow Tags

        </div>

        <div className="mt-4 flex flex-wrap gap-2">

          {

            node?.workflow_tags
              ?.length

              ? (

                  node.workflow_tags.map(

                    (
                      tag,
                      tagIndex
                    ) => (

                      <EdgeBadge

                        key={tagIndex}

                        value={tag}

                      />
                    )
                  )
                )

              : (

                  <div className="text-sm text-zinc-500">

                    No workflow tags

                  </div>
                )
          }

        </div>

      </div>

      {/* ================================================================
      🔥 Matched Attributes
      ================================================================ */}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">

        <div className="text-xs uppercase tracking-wide text-zinc-500">

          Matched Attributes

        </div>

        <div className="mt-4 flex flex-wrap gap-2">

          {

            edge?.matched_attributes
              ?.length

              ? (

                  edge.matched_attributes.map(

                    (
                      attribute,
                      attributeIndex
                    ) => (

                      <EdgeBadge

                        key={attributeIndex}

                        value={attribute}

                      />
                    )
                  )
                )

              : (

                  <div className="text-sm text-zinc-500">

                    No matched attributes

                  </div>
                )
          }

        </div>

      </div>

    </div>
  )
}

/* ============================================================================
🔥 Traversal Edge Inspector
============================================================================ */

export default function TraversalEdgeInspector({

  runtime,

}: TraversalInspectorProps) {

  /* ==========================================================================
  🔥 Semantic Related
  ========================================================================== */

  const semanticRelated =

    runtime
      ?.payload
      ?.semantic_related

      || []

  /* ==========================================================================
  🔥 Runtime Safety
  ========================================================================== */

  if (!semanticRelated.length) {

    return (

      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

        <h2 className="text-lg font-bold">

          🧬 Traversal Edge Inspector

        </h2>

        <p className="mt-4 text-sm text-zinc-500">

          No semantic traversal edges available.

        </p>

      </section>
    )
  }

  /* ==========================================================================
  🔥 Traversal Observatory
  ========================================================================== */

  return (

    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

      {/* ================================================================
      🔥 Header
      ================================================================ */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold">

            🧬 Traversal Edge Inspector

          </h2>

          <p className="mt-1 text-sm text-zinc-500">

            Semantic traversal graph observability
            and continuation runtime visualization

          </p>

        </div>

        <div className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400">

          runtime/traversal

        </div>

      </div>

      {/* ================================================================
      🔥 Traversal Summary
      ================================================================ */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <InspectorCard

          title="Continuation Nodes"

          value={
            semanticRelated.length
          }

        />

        <InspectorCard

          title="Traversal Runtime"

          value={true}

        />

        <InspectorCard

          title="Semantic Continuation"

          value={true}

        />

        <InspectorCard

          title="Graph Observability"

          value={true}

        />

      </div>

      {/* ================================================================
      🔥 Traversal Nodes
      ================================================================ */}

      <div className="mt-8 space-y-6">

        {

          semanticRelated.map(

            (
              node:
                SemanticRelatedNode,

              index:
                number,
            ) => (

              <TraversalNode

                key={
                  node?.unique_id
                  || index
                }

                node={node}

                index={index}

              />
            )
          )
        }

      </div>

      {/* ================================================================
      🔥 Traversal Runtime Meaning
      ================================================================ */}

      <div className="mt-8 rounded-xl border border-zinc-800 bg-black p-5">

        <div className="text-xs uppercase tracking-wide text-zinc-500">

          Traversal Runtime Meaning

        </div>

        <div className="mt-4 space-y-2 text-sm text-zinc-300">

          <div>

            🔗 Traversal edges represent semantic continuation

          </div>

          <div>

            🌌 Workflow relations represent exploration evolution

          </div>

          <div>

            🛰 Similarity scores represent semantic continuity strength

          </div>

          <div>

            🧠 Matched attributes represent semantic overlap observability

          </div>

          <div>

            ❌ Traversal inference prohibited

          </div>

        </div>

      </div>

    </section>
  )
}