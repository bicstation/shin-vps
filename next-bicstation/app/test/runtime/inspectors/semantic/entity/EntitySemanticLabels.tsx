// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/entity/EntitySemanticLabels.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Entity Semantic Labels
 * ============================================================================
 *
 * PURPOSE:
 *
 * Semantic label observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * semantic label runtime visualization
 *
 * NOT:
 *
 * semantic normalization
 * runtime mutation
 * label transformation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorSection
from '../shared/InspectorSection'

import RuntimeBadge
from '../shared/RuntimeBadge'

import RawJsonInspector
from '../shared/RawJsonInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type EntitySemanticLabelsProps = {

  semantic_labels?: any[]
}

/* ============================================================================
🔥 Semantic Label Chip
============================================================================ */

function SemanticLabelChip({

  label,

}: {

  label: any

}) {

  /* ==========================================================================
  🔥 Display Label
  ========================================================================== */

  const displayLabel =

    typeof label === 'string'

      ? label

      : (
          label?.label
          || label?.name
          || label?.slug
          || 'semantic-label'
        )

  /* ==========================================================================
  🔥 Semantic Color
  ========================================================================== */

  const semanticColor =

    typeof label === 'object'

      ? label?.color

      : null

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🏷️ SEMANTIC LABEL CHIP',

    {

      displayLabel,

      semanticColor,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div

      className="rounded-full border border-fuchsia-900 bg-fuchsia-950/30 px-4 py-2 text-xs text-fuchsia-300"

      style={

        semanticColor

          ? {

              borderColor:
                semanticColor,

              color:
                semanticColor,
            }

          : undefined
      }

    >

      {displayLabel}

    </div>
  )
}

/* ============================================================================
🔥 Entity Semantic Labels
============================================================================ */

export default function EntitySemanticLabels({

  semantic_labels,

}: EntitySemanticLabelsProps) {

  /* ==========================================================================
  🔥 Semantic Labels
  ========================================================================== */

  const semanticLabels =

    Array.isArray(
      semantic_labels
    )

      ? semantic_labels

      : []

  /* ==========================================================================
  🔥 Runtime Status
  ========================================================================== */

  const hasSemanticLabels =

    semanticLabels.length > 0

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🏷️ ENTITY SEMANTIC LABELS',

    {

      labels:

        semanticLabels.length,

      hasSemanticLabels,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🏷️ Entity Semantic Labels"

      description="Semantic label observability and semantic rendering authority visualization."

      badge="runtime/semantic-labels"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="labels"

          value={
            String(
              semanticLabels.length
            )
          }

          variant={
            hasSemanticLabels
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="semantic"

          value={
            hasSemanticLabels
              ? 'active'
              : 'inactive'
          }

          variant="semantic"

        />

      </div>

      {/* ================================================================
      🔥 Labels
      ================================================================ */}

      {

        hasSemanticLabels

          ? (

              <div className="flex flex-wrap gap-3">

                {

                  semanticLabels.map(

                    (

                      label: any,

                      index: number

                    ) => (

                      <SemanticLabelChip

                        key={index}

                        label={label}

                      />

                    )
                  )
                }

              </div>
            )

          : (

              <div className="rounded-xl border border-zinc-800 bg-black p-6 text-sm text-zinc-500">

                No semantic labels detected.

              </div>
            )
      }

      {/* ================================================================
      🔥 Raw Semantic Labels
      ================================================================ */}

      <RawJsonInspector

        title="Raw Semantic Labels"

        description="Raw semantic label authority payload observability."

        badge="runtime/labels-raw"

        payload={semanticLabels}

      />

    </InspectorSection>
  )
}