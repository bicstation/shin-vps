// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/types/semantic.ts
// ============================================================================

/* ============================================================================
🔥 Semantic Role
============================================================================ */

export type SemanticRole =

  | 'primary'
  | 'secondary'
  | 'highlight'
  | 'featured'
  | 'default'

/* ============================================================================
🔥 Semantic Tone
============================================================================ */

export type SemanticTone =

  | 'cinematic'
  | 'spotlight'
  | 'balanced'
  | 'premium'
  | 'neutral'

/* ============================================================================
🔥 Semantic Layout
============================================================================ */

export type SemanticLayout =

  | 'flagship'
  | 'discovery'
  | 'exploration'

/* ============================================================================
🔥 Semantic Glow Runtime
============================================================================ */

export type SemanticGlowRuntime = {

  glow: string

  border: string

  accent: string

  shadow: string

}

/* ============================================================================
🔥 Semantic Presentation Runtime
============================================================================ */

export type SemanticPresentationRuntime = {

  eyebrow: string

  tone: SemanticTone

  emphasis: string

  layout: SemanticLayout

}

/* ============================================================================
🔥 Semantic Motion Runtime
============================================================================ */

export type SemanticMotionRuntime = {

  duration: string

  easing: string

  hoverScale: string

  hoverTranslateY: string

  glowStrength: string

  blur: string

}

/* ============================================================================
🔥 Semantic Theme Runtime
============================================================================ */

export type SemanticThemeRuntime = {

  glow: string

  accent: string

  surface: string

  border: string

  text: string

  muted: string

}