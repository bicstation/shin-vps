
// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticPresentation.ts

/* =========================================
🔥 Imports
========================================= */

import {

  resolveSemanticLabel,

} from './semanticLabelMap'

import {

  resolveSemanticIcon,

} from './semanticIcons'

import {

  resolveSemanticExplanation,

} from './semanticExplanation'

import {

  semanticHeroCopy,

} from './semanticHeroCopy'

import {

  semanticHeroPolicy,

} from './semanticHeroPolicy'

/* =========================================
🔥 Types
========================================= */

export type SemanticPresentation = {

  // --------------------------------------
  // identity
  // --------------------------------------

  slug: string

  type?: string

  // --------------------------------------
  // display
  // --------------------------------------

  label: string

  explanation: string

  icon: string

  // --------------------------------------
  // semantic
  // --------------------------------------

  semantic_role?: string

  semantic_weight?: number

  // --------------------------------------
  // hero
  // --------------------------------------

  heroCopy?: {

    catch: string

    sub: string
  }

  // --------------------------------------
  // visual policy
  // --------------------------------------

  heroPolicy?: {

    accent: string

    cta: string

    emphasis: string
  }

  // --------------------------------------
  // passthrough
  // --------------------------------------

  raw?: Record<
    string,
    any
  >
}

/* =========================================
🔥 Default Hero Copy
========================================= */

const DEFAULT_HERO_COPY =

  semanticHeroCopy
    .default

/* =========================================
🔥 Default Hero Policy
========================================= */

const DEFAULT_HERO_POLICY =

  semanticHeroPolicy
    .default

/* =========================================
🔥 Resolve Hero Copy
========================================= */

function resolveHeroCopy(
  slug: string
) {

  return (

    semanticHeroCopy[
      slug
    ]

    || DEFAULT_HERO_COPY
  )
}

/* =========================================
🔥 Resolve Hero Policy
========================================= */

function resolveHeroPolicy(
  slug: string
) {

  return (

    semanticHeroPolicy[
      slug
    ]

    || DEFAULT_HERO_POLICY
  )
}

/* =========================================
🔥 Resolve Semantic Presentation
========================================= */

export function
resolveSemanticPresentation(
  semantic:
    string
    | Record<string, any>
): SemanticPresentation {

  // ======================================
  // string slug
  // ======================================

  if (
    typeof semantic ===
    'string'
  ) {

    const explanation =
      resolveSemanticExplanation(
        semantic
      )

    return {

      slug:
        semantic,

      label:
        resolveSemanticLabel(
          semantic
        ),

      explanation:
        explanation.label,

      icon:
        resolveSemanticIcon(
          semantic
        ),

      heroCopy:
        resolveHeroCopy(
          semantic
        ),

      heroPolicy:
        resolveHeroPolicy(
          semantic
        ),
    }
  }

  // ======================================
  // object semantic
  // ======================================

  const slug =
    semantic?.slug || ''

  const explanation =
    resolveSemanticExplanation(
      semantic
    )

  return {

    // -----------------------------------
    // identity
    // -----------------------------------

    slug,

    type:
      semantic?.type,

    // -----------------------------------
    // display
    // -----------------------------------

    label:
      resolveSemanticLabel(
        semantic
      ),

    explanation:
      explanation.label,

    icon:
      resolveSemanticIcon(
        semantic
      ),

    // -----------------------------------
    // semantic
    // -----------------------------------

    semantic_role:
      semantic?.semantic_role,

    semantic_weight:
      semantic?.semantic_weight,

    // -----------------------------------
    // hero
    // -----------------------------------

    heroCopy:
      resolveHeroCopy(
        slug
      ),

    heroPolicy:
      resolveHeroPolicy(
        slug
      ),

    // -----------------------------------
    // passthrough
    // -----------------------------------

    raw:
      semantic,
  }
}

/* =========================================
🔥 Multiple Semantic Presentations
========================================= */

export function
resolveSemanticPresentations(
  semantics:
    Array<
      string
      | Record<string, any>
    >
): SemanticPresentation[] {

  if (
    !semantics?.length
  ) {

    return []
  }

  return semantics.map(
    resolveSemanticPresentation
  )
}

