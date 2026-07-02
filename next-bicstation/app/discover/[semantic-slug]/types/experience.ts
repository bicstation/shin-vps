// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Experience Dictionary Contract
// ============================================================================

/* ============================================================================
Shared Experience Asset
============================================================================ */

export interface ExperienceAsset {

  /**
   * Shared Semantic Icon Key
   *
   * Must exist in:
   *
   * shared/lib/ui/semantic/icon-map.ts
   */
  icon?: string

  /**
   * Experience Theme Color
   */
  accentColor?: string

}

/* ============================================================================
Hero
============================================================================ */

export interface ExperienceHero extends ExperienceAsset {

  label: string

  title: string

  catchCopy: string

  description: string

  backgroundImage: string

}

/* ============================================================================
About
============================================================================ */

export interface ExperienceAbout extends ExperienceAsset {

  title: string

  body: string

}

/* ============================================================================
Elements
============================================================================ */

export interface ExperienceElements extends ExperienceAsset {

  title: string

  description: string

  keywords: string[]

}

/* ============================================================================
Representative Products
============================================================================ */

export interface ExperienceProducts extends ExperienceAsset {

  title: string

  description: string

}

/* ============================================================================
Related Worlds
============================================================================ */

export interface ExperienceRelated extends ExperienceAsset {

  title: string

  description: string

}

/* ============================================================================
Continue Discovery
============================================================================ */

export interface ExperienceContinue extends ExperienceAsset {

  title: string

  description: string

  buttonLabel: string

}

/* ============================================================================
Experience Dictionary
============================================================================ */

export interface ExperienceDictionary {

  hero: ExperienceHero

  about: ExperienceAbout

  elements: ExperienceElements

  products: ExperienceProducts

  related: ExperienceRelated

  continue: ExperienceContinue

}