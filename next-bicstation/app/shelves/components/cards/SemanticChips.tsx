// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/cards/SemanticChips.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Semantic Chips
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic metadata renderer
 *   - workflow discovery chips
 *   - human-readable semantic UX
 *
 * IMPORTANT:
 *   - backend owns semantic authority
 *   - frontend translates semantic readability only
 *
 * ============================================================================
 */

import styles from '../../styles/card.module.css'

import {
  extractSemanticLabels,
} from '../../utils/extractSemanticLabels'

import {
  translateSemanticLabel,
} from '../../translation/semanticLabels'

import workflowCopy from '../../translation/workflowCopy'

import type {
  GroupedAttributes,
} from '../../types/semantic'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  groupedAttributes?: GroupedAttributes

  limit?: number
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function SemanticChips({

  groupedAttributes,

  limit = 4,

}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const semanticLabels =
    extractSemanticLabels(
      groupedAttributes,
      limit
    )

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (
    !semanticLabels.length
  ) {

    return null
  }

  /* ==========================================================================
  🔥 Fallback
  ========================================================================== */

  const semanticFallback =
    workflowCopy
      .cardCopy
      .semanticFallback

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.cardChips}>

      {semanticLabels.map(
        (
          semantic,
          index
        ) => {

          const slug =
            semantic?.slug

          const translatedLabel =
            translateSemanticLabel(
              slug
            )

          const label =

            translatedLabel
            ||

            semantic?.label
            ||

            semantic?.name
            ||

            semanticFallback

          return (

            <div
              key={
                slug
                || index
              }
              className={
                styles.cardChip
              }
            >

              {label}

            </div>

          )
        }
      )}

    </div>

  )
}