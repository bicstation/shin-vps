
// Semantic Explanation for Attributes
// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticExplanation.ts

/* =========================================
🔥 Imports
========================================= */

import {
  semanticLabelMap,
} from './semanticLabelMap'

/* =========================================
🔥 Types
========================================= */

export type SemanticExplanation = {

  slug: string

  label: string

  type?: string

  icon?: string

  color?: string

  semantic_role?: string

  semantic_weight?: number
}

/* =========================================
🔥 Attribute Resolver
========================================= */

export function
resolveSemanticExplanation(
  attribute:
    string
    | Record<string, any>
): SemanticExplanation {

  // ======================================
  // string slug
  // ======================================

  if (
    typeof attribute ===
    'string'
  ) {

    return {

      slug: attribute,

      label:

        semanticLabelMap[
          attribute
        ]

        || attribute,
    }
  }

  // ======================================
  // object
  // ======================================

  const slug =
    attribute?.slug || ''

  return {

    slug,

    label:

      attribute?.name

      || semanticLabelMap[
          slug
        ]

      || slug,

    type:
      attribute?.type,

    icon:
      attribute?.icon,

    color:
      attribute?.color,

    semantic_role:
      attribute?.semantic_role,

    semantic_weight:
      attribute?.semantic_weight,
  }
}

/* =========================================
🔥 Multiple Resolver
========================================= */

export function
resolveSemanticExplanations(
  attributes:
    Array<
      string
      | Record<string, any>
    >
): SemanticExplanation[] {

  if (
    !attributes?.length
  ) {

    return []
  }

  return attributes.map(
    resolveSemanticExplanation
  )
}

/* =========================================
🔥 Human Labels Only
========================================= */

export function
resolveSemanticLabels(
  attributes:
    Array<
      string
      | Record<string, any>
    >
): string[] {

  return resolveSemanticExplanations(
    attributes
  ).map(
    item => item.label
  )
}

