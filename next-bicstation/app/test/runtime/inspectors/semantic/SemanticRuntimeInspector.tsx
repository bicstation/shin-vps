// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/SemanticRuntimeInspector.tsx
// ============================================================================

'use client'

/**
 * SHIN CORE LINX
 * Semantic Runtime Inspector
 *
 * Semantic Runtime Observatory Layer
 *
 * IMPORTANT:
 * This component observes:
 *
 * semantic authority payloads
 *
 * NOT:
 *
 * normalized UI payloads
 */

/* ============================================================================
🔥 Imports
============================================================================ */

import type {

  SemanticInspectorProps,

} from '../contracts/semantic'

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
🔥 Semantic Label
============================================================================ */

function SemanticLabel({

  label,

}: {

  label: any

}) {

  return (

    <div className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-300">

      {

        typeof label === 'string'

          ? label

          : (

              label?.label
              || label?.name
              || 'semantic-label'
            )
      }

    </div>
  )
}

/* ============================================================================
🔥 Semantic Runtime Inspector
============================================================================ */

export default function SemanticRuntimeInspector({

  semantic_runtime,

  adaptive_runtime,

  semantic_labels,

  semantic_metadata,

}: SemanticInspectorProps) {

  /* ==========================================================================
  🔥 Semantic Runtime Safety
  ========================================================================== */

  const semanticRuntime =

    semantic_runtime || {}

  const adaptiveRuntime =

    adaptive_runtime || {}

  const labels =

    semantic_labels || []

  const metadata =

    semantic_metadata || {}

  /* ==========================================================================
  🔥 Nested Runtime Extraction
  ========================================================================== */

  /**
   * IMPORTANT:
   *
   * Real backend payload structure:
   *
   * semantic_runtime.workflow_tags
   * semantic_runtime.semantic_graph
   * semantic_runtime.semantic_role
   *
   * NOT:
   *
   * runtime.workflow_tags
   */

  const workflowTags =

    semanticRuntime?.workflow_tags
    || []

  const semanticGraph =

    semanticRuntime?.semantic_graph
    || []

  const semanticRole =

    semanticRuntime?.semantic_role
    || semanticRuntime?.primary_workflow
    || '-'

  const semanticScore =

    semanticRuntime?.semantic_score
    || metadata?.semantic_score
    || '-'

  const semanticConfidence =

    semanticRuntime?.confidence
    || metadata?.confidence
    || '-'

  const semanticVersion =

    semanticRuntime?.semantic_version
    || metadata?.semantic_schema_version
    || '-'

  const groupedAttributes =

    metadata?.grouped_attributes
    || {}

  /* ==========================================================================
  🔥 Debug
  ========================================================================== */

  console.log(

    '🔥 SEMANTIC RUNTIME INSPECTOR',

    {

      semanticRuntime,

      workflowTags,

      semanticGraph,

      semanticRole,

      labels,

      adaptiveRuntime,
    }
  )

  /* ==========================================================================
  🔥 Observatory
  ========================================================================== */

  return (

    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

      {/* ================================================================
      🔥 Header
      ================================================================ */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold">

            🧠 Semantic Runtime Inspector

          </h2>

          <p className="mt-1 text-sm text-zinc-500">

            Semantic runtime observability
            and cinematic semantic rendering

          </p>

        </div>

        <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">

          runtime/semantic

        </div>

      </div>

      {/* ================================================================
      🔥 Runtime Cards
      ================================================================ */}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        <InspectorCard
          title="Primary Workflow"
          value={
            semanticRuntime?.primary_workflow
          }
        />

        <InspectorCard
          title="Semantic Role"
          value={semanticRole}
        />

        <InspectorCard
          title="Semantic Group"
          value={
            semanticRuntime?.base_type
          }
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
          title="Schema Version"
          value={semanticVersion}
        />

      </div>

      {/* ================================================================
      🔥 Workflow Tags
      ================================================================ */}

      <div className="mt-8">

        <h3 className="text-sm font-semibold text-zinc-300">

          Workflow Tags

        </h3>

        <div className="mt-3 flex flex-wrap gap-2">

          {

            workflowTags.length > 0

              ? (

                  workflowTags.map(

                    (
                      tag: any,
                      index: number,
                    ) => (

                      <SemanticLabel
                        key={index}
                        label={tag}
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
      🔥 Semantic Labels
      ================================================================ */}

      <div className="mt-8">

        <h3 className="text-sm font-semibold text-zinc-300">

          Semantic Labels

        </h3>

        <div className="mt-3 flex flex-wrap gap-2">

          {

            labels.length > 0

              ? (

                  labels.map(

                    (
                      label: any,
                      index: number,
                    ) => (

                      <SemanticLabel
                        key={index}
                        label={label}
                      />

                    )
                  )
                )

              : (

                  <div className="text-sm text-zinc-500">

                    No semantic labels

                  </div>
                )
          }

        </div>

      </div>

      {/* ================================================================
      🔥 Adaptive Runtime
      ================================================================ */}

      <div className="mt-8">

        <h3 className="text-sm font-semibold text-zinc-300">

          Adaptive Runtime

        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">

          <InspectorCard
            title="Adaptive Title"
            value={
              adaptiveRuntime?.focus
            }
          />

          <InspectorCard
            title="Adaptive Role"
            value={
              adaptiveRuntime?.ui_mode
            }
          />

        </div>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-black p-4 text-sm text-zinc-400">

          {

            adaptiveRuntime?.interaction_hint
            || 'No adaptive summary'
          }

        </div>

      </div>

      {/* ================================================================
      🔥 Grouped Attributes
      ================================================================ */}

      <div className="mt-8">

        <h3 className="text-sm font-semibold text-zinc-300">

          Grouped Attributes

        </h3>

        <pre className="mt-4 overflow-auto rounded-lg border border-zinc-800 bg-black p-4 text-xs text-zinc-400">

          {

            JSON.stringify(
              groupedAttributes,
              null,
              2,
            )
          }

        </pre>

      </div>

      {/* ================================================================
      🔥 Semantic Graph
      ================================================================ */}

      <div className="mt-8">

        <h3 className="text-sm font-semibold text-zinc-300">

          Semantic Graph

        </h3>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-black p-4 text-sm text-zinc-400">

          Graph Edges:

          {' '}

          <span className="text-cyan-300">

            {semanticGraph.length}

          </span>

        </div>

      </div>

      {/* ================================================================
      🔥 Meaning
      ================================================================ */}

      <div className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 text-sm text-cyan-100">

        <div className="space-y-2">

          <div>

            🧠 Semantic runtime represents meaning authority

          </div>

          <div>

            🎬 Adaptive runtime represents cinematic rendering hints

          </div>

          <div>

            🛰 Workflow tags represent traversal-safe semantic grouping

          </div>

          <div>

            🔗 Semantic labels represent UI semantic rendering

          </div>

          <div className="text-red-300">

            ❌ Semantic inference prohibited

          </div>

        </div>

      </div>

      /* ================================================================
      🔥 Raw Semantic Runtime JSON
      ================================================================ */

      <div className="mt-8">

        <h3 className="text-sm font-semibold text-zinc-300">

          Raw Semantic Runtime JSON

        </h3>

        <div className="mt-4 overflow-auto rounded-xl border border-zinc-800 bg-black">

          <pre className="p-4 text-xs leading-6 text-cyan-300">

            {

              JSON.stringify(

                {

                  semantic_runtime:
                    semanticRuntime,

                  adaptive_runtime:
                    adaptiveRuntime,

                  semantic_labels:
                    labels,

                  grouped_attributes:
                    groupedAttributes,

                  semantic_graph:
                    semanticGraph,

                },

                null,

                2
              )
            }

          </pre>

        </div>

      </div>

    </section>
  )
}