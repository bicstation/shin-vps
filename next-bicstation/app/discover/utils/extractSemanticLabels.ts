// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/utils/extractSemanticLabels.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Extract Semantic Labels
 * ============================================================================
 *
 * PURPOSE:
 *   - extract semantic chips from grouped runtime
 *   - normalize semantic metadata for frontend rendering
 *   - lightweight semantic presentation helper
 *
 * IMPORTANT:
 *   - semantic meaning authority remains backend
 *   - frontend only formats runtime metadata
 *
 * ============================================================================
 */

import type {
  GroupedAttributes,
  SemanticMetadata,
} from '../types/semantic'

/* ============================================================================
🔥 Extract Semantic Labels
============================================================================ */

export function extractSemanticLabels(

  groupedAttributes?: GroupedAttributes,

  limit: number = 4

): SemanticMetadata[] {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!groupedAttributes) {

    return []
  }

  /* ==========================================================================
  🔥 Flatten
  ========================================================================== */

  const flattened = Object.values(
    groupedAttributes
  )
    .flat()

  /* ==========================================================================
  🔥 Normalize
  ========================================================================== */

  const normalized =
    flattened.filter(Boolean)

  /* ==========================================================================
  🔥 Deduplicate
  ========================================================================== */

  const unique =
    normalized.filter(
      (
        attribute,
        index,
        self
      ) => {

        const slug =
          attribute?.slug

        if (!slug) {

          return true
        }

        return (
          self.findIndex(
            item =>
              item?.slug === slug
          ) === index
        )
      }
    )

  /* ==========================================================================
  🔥 Limit
  ========================================================================== */

  return unique.slice(
    0,
    limit
  )
}

/* ============================================================================
🔥 Extract Semantic Slugs
============================================================================ */

export function extractSemanticSlugs(

  groupedAttributes?: GroupedAttributes,

  limit: number = 4

): string[] {

  return extractSemanticLabels(
    groupedAttributes,
    limit
  )
    .map(
      attribute =>
        attribute?.slug
    )
    .filter(Boolean) as string[]
}

/* ============================================================================
🔥 Extract Semantic Names
============================================================================ */

export function extractSemanticNames(

  groupedAttributes?: GroupedAttributes,

  limit: number = 4

): string[] {

  return extractSemanticLabels(
    groupedAttributes,
    limit
  )
    .map(
      attribute => (

        attribute?.label
        ||

        attribute?.name
        ||

        attribute?.slug
        ||

        'semantic'
      )
    )
}

/* ============================================================================
🔥 Export
============================================================================ */

export default extractSemanticLabels