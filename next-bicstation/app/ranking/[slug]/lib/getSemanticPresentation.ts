// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/lib/getSemanticPresentation.ts
// ============================================================================

type SemanticPresentation = {

  eyebrow: string

  tone: string

  emphasis: string

  layout: 'flagship' | 'discovery' | 'exploration'

}

/* ============================================================================
🔥 Semantic Presentation Runtime
============================================================================ */

const PRESENTATION_MAP: Record<
  string,
  SemanticPresentation
> = {

  /* ==========================================================================
  🔥 Primary
  ========================================================================== */

  primary: {

    eyebrow:
      'FLAGSHIP DISCOVERY',

    tone:
      'cinematic',

    emphasis:
      'maximum',

    layout:
      'flagship',

  },

  /* ==========================================================================
  🔥 Highlight
  ========================================================================== */

  highlight: {

    eyebrow:
      'HIGHLIGHT RUNTIME',

    tone:
      'spotlight',

    emphasis:
      'high',

    layout:
      'discovery',

  },

  /* ==========================================================================
  🔥 Secondary
  ========================================================================== */

  secondary: {

    eyebrow:
      'DISCOVERY CATEGORY',

    tone:
      'balanced',

    emphasis:
      'medium',

    layout:
      'discovery',

  },

  /* ==========================================================================
  🔥 Featured
  ========================================================================== */

  featured: {

    eyebrow:
      'FEATURED MODEL',

    tone:
      'premium',

    emphasis:
      'high',

    layout:
      'flagship',

  },

  /* ==========================================================================
  🔥 Default
  ========================================================================== */

  default: {

    eyebrow:
      'SEMANTIC EXPLORATION',

    tone:
      'neutral',

    emphasis:
      'standard',

    layout:
      'exploration',

  },

}

/* ============================================================================
🔥 Get Semantic Presentation
============================================================================ */

export function getSemanticPresentation(
  semanticRole?: string | null
): SemanticPresentation {

  if (!semanticRole) {

    return PRESENTATION_MAP.default
  }

  return (
    PRESENTATION_MAP[
      semanticRole
    ]
    ||
    PRESENTATION_MAP.default
  )
}