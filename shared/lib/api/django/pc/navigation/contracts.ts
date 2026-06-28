/* ============================================================================
🔥 Navigation Meaning
============================================================================ */

export interface NavigationMeaning {

  identity?: string

  mission?: string

  user_intent?: string

  meaning_statement?: string

  existence_reason?: string
}

/* ============================================================================
🔥 Presentation Runtime
============================================================================ */

export interface NavigationPresentation {

  title?: string

  subtitle?: string

  description?: string
}

/* ============================================================================
🔥 Navigation Attribute
============================================================================ */

export interface NavigationAttribute {

  slug: string

  name: string

  title?: string

  subtitle?: string

  description?: string

  type?: string

  icon?: string

  color?: string

  semantic_role?: string

  semantic_weight?: number | string

  is_ranking_enabled?: boolean | string
}

/* ============================================================================
🔥 Navigation Runtime Item
============================================================================ */

export interface NavigationRuntimeItem {

  slug: string

  name: string

  title?: string

  subtitle?: string

  description?: string

  type: string

  parent_group?: string

  icon?: string

  color?: string

  sort_order?: number | string

  product_count?: number

  attributes?: NavigationAttribute[]
}

/* ============================================================================
🔥 Navigation Runtime
============================================================================ */

export interface NavigationRuntime {

  /* ========================================================================
  Runtime Status
  ======================================================================== */

  success?: boolean

  /* ========================================================================
  Meaning
  ======================================================================== */

  meaning?: NavigationMeaning

  presentation?: NavigationPresentation

  seo?: any

  /* ========================================================================
  Navigation
  ======================================================================== */

  intents: NavigationRuntimeItem[]

  /* ========================================================================
  Runtime Authority
  ======================================================================== */

  semantic_schema_version?: number

  authority_version?: string

  semantic_authority?: string

  ready?: boolean

  /* ========================================================================
  Raw Backup
  ======================================================================== */

  raw?: any
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type NavigationRuntimeResponse =
  NavigationRuntime