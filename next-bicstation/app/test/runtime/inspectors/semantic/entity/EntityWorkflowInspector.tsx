// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/entity/EntityWorkflowInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Entity Workflow Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Semantic workflow observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * workflow runtime visualization
 *
 * NOT:
 *
 * semantic normalization
 * runtime mutation
 * workflow orchestration rewriting
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

type EntityWorkflowInspectorProps = {

  semantic_runtime?: any
}

/* ============================================================================
🔥 Workflow Tag Chip
============================================================================ */

function WorkflowTagChip({

  tag,

}: {

  tag: any

}) {

  /* ==========================================================================
  🔥 Display Tag
  ========================================================================== */

  const displayTag =

    typeof tag === 'string'

      ? tag

      : (
          tag?.tag
          || tag?.name
          || tag?.slug
          || 'workflow-tag'
        )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className="rounded-full border border-cyan-900 bg-cyan-950/30 px-4 py-2 text-xs text-cyan-300">

      {displayTag}

    </div>
  )
}

/* ============================================================================
🔥 Entity Workflow Inspector
============================================================================ */

export default function EntityWorkflowInspector({

  semantic_runtime,

}: EntityWorkflowInspectorProps) {

  /* ==========================================================================
  🔥 Semantic Runtime
  ========================================================================== */

  const semanticRuntime =

    typeof semantic_runtime === 'object'
      && semantic_runtime !== null

        ? semantic_runtime

        : {}

  /* ==========================================================================
  🔥 Workflow Tags
  ========================================================================== */

  const workflowTags =

    Array.isArray(
      semanticRuntime?.workflow_tags
    )

      ? semanticRuntime.workflow_tags

      : []

  /* ==========================================================================
  🔥 Primary Workflow
  ========================================================================== */

  const primaryWorkflow =

    workflowTags[0]
    || semanticRuntime?.primary_workflow
    || '-'

  /* ==========================================================================
  🔥 Workflow Runtime
  ========================================================================== */

  const workflowRuntime =

    semanticRuntime?.workflow_runtime
    || {}

  /* ==========================================================================
  🔥 Workflow Metadata
  ========================================================================== */

  const workflowMode =

    workflowRuntime?.mode
    || '-'

  const workflowConfidence =

    workflowRuntime?.confidence
    || semanticRuntime?.workflow_confidence
    || '-'

  /* ==========================================================================
  🔥 Runtime Status
  ========================================================================== */

  const hasWorkflowRuntime =

    workflowTags.length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🛰️ ENTITY WORKFLOW INSPECTOR',

    {

      primaryWorkflow,

      workflowMode,

      workflowConfidence,

      workflowTags:

        workflowTags.length,

      hasWorkflowRuntime,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🛰️ Entity Workflow Inspector"

      description="Workflow runtime observability and semantic traversal workflow visualization."

      badge="runtime/workflow"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="workflow"

          value={
            hasWorkflowRuntime
              ? 'active'
              : 'inactive'
          }

          variant={
            hasWorkflowRuntime
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="primary"

          value={
            typeof primaryWorkflow === 'string'

              ? primaryWorkflow

              : (
                  primaryWorkflow?.name
                  || primaryWorkflow?.tag
                  || '-'
                )
          }

          variant="topology"

        />

      </div>

      {/* ================================================================
      🔥 Workflow Runtime Grid
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        <InspectorCard

          title="Primary Workflow"

          value={primaryWorkflow}

        />

        <InspectorCard

          title="Workflow Mode"

          value={workflowMode}

        />

        <InspectorCard

          title="Workflow Confidence"

          value={workflowConfidence}

        />

        <InspectorCard

          title="Workflow Tags"

          value={workflowTags.length}

        />

      </div>

      {/* ================================================================
      🔥 Workflow Tags
      ================================================================ */}

      {

        workflowTags.length > 0

          ? (

              <div className="flex flex-wrap gap-3">

                {

                  workflowTags.map(

                    (

                      tag: any,

                      index: number

                    ) => (

                      <WorkflowTagChip

                        key={index}

                        tag={tag}

                      />

                    )
                  )
                }

              </div>
            )

          : (

              <div className="rounded-xl border border-zinc-800 bg-black p-6 text-sm text-zinc-500">

                No workflow tags detected.

              </div>
            )
      }

      {/* ================================================================
      🔥 Workflow Runtime
      ================================================================ */}

      <InspectorCard

        title="Workflow Runtime"

        value={workflowRuntime}

        mono

        badge="runtime/workflow-runtime"

        description="Workflow runtime orchestration and semantic traversal metadata."

      />

      {/* ================================================================
      🔥 Raw Workflow Runtime
      ================================================================ */}

      <RawJsonInspector

        title="Raw Workflow Runtime"

        description="Raw workflow runtime authority payload observability."

        badge="runtime/workflow-raw"

        payload={workflowRuntime}

      />

    </InspectorSection>
  )
}