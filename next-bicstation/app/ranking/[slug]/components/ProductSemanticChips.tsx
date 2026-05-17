// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/ProductSemanticChips.tsx
// ============================================================================

'use client'

import styles from '../RankingSlugPage.module.css'

type Props = {
  groupedAttributes?: Record<
    string,
    any[]
  >
}

/* ============================================================================
🔥 Product Semantic Chips
============================================================================ */

export default function ProductSemanticChips({
  groupedAttributes = {},
}: Props) {

  /* ==========================================================================
  🔥 Flatten Runtime Attributes
  ========================================================================== */

  const chips =
    Object.entries(
      groupedAttributes
    ).flatMap(
      ([groupKey, attrs]) =>

        (attrs || []).map(
          (attr: any) => ({

            groupKey,

            slug:
              attr?.slug,

            name:
              attr?.name,

            icon:
              attr?.icon,

            semanticRole:
              attr?.semantic_role,

          })
        )
    )

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!chips.length) {

    return null
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.semanticChips}>

      {chips.map(
        (
          chip,
          index
        ) => (

          <div
            key={
              chip.slug
              ||
              `${chip.groupKey}-${index}`
            }
            className={
              styles.semanticChip
            }
          >

            {/* Icon */}
            {chip.icon && (

              <span
                className={
                  styles.semanticChipIcon
                }
              >

                {chip.icon}

              </span>

            )}

            {/* Name */}
            <span
              className={
                styles.semanticChipLabel
              }
            >

              {chip.name}

            </span>

          </div>

        )
      )}

    </div>

  )
}