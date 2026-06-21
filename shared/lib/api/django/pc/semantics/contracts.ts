// ============================================================================
// 🔥 Semantic Universe
// ============================================================================

export interface SemanticUniverse {

  universe_slug: string

  universe_title: string

  sort_order?: string

  is_active?: string

  is_adult?: string
}

/* ============================================================================
🔥 Semantic Navigation Item
============================================================================ */

export interface SemanticNavigationItem {

  slug: string

  name: string

  title?: string

  description?: string

  type?: string

  icon?: string

  color?: string

  parent_group?: string

  attribute_count?: number

  product_count?: number
}

/* ============================================================================
🔥 Semantic Discover Shelf
============================================================================ */

export interface SemanticDiscoverShelf {

  group_slug: string

  group_name: string

  parent_group?: string

  type?: string

  icon?: string

  color?: string

  sort_order?: string

  discovery_priority?: string

  is_active?: string

  product_count?: number
}

/* ============================================================================
🔥 Semantic Discover Runtime
============================================================================ */

export interface SemanticDiscoverRuntime {

  product_count?: number

  group_count?: number

  attribute_count?: number

  shelf_count?: number

  shelves: SemanticDiscoverShelf[]
}

/* ============================================================================
🔥 Semantic Meaning
============================================================================ */

export interface SemanticMeaning {

  identity?: string

  mission?: string

  user_intent?: string

  meaning_statement?: string

  existence_reason?: string
}

/* ============================================================================
🔥 Semantic SEO
============================================================================ */

export interface SemanticSEO {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  schema_jsonld?: any
}

/* ============================================================================
🔥 Semantic Summary
============================================================================ */

export interface SemanticSummary {

  navigation_count?: number

  sidebar_count?: number

  shelf_count?: number

  universe_count?: number

  product_count?: number

  attribute_count?: number
}

/* ============================================================================
🔥 Semantic Runtime Response
============================================================================ */

export interface SemanticRuntimeResponse {

  universes: SemanticUniverse[]

  navigation: SemanticNavigationItem[]

  sidebar: SemanticNavigationItem[]

  discover: SemanticDiscoverRuntime

  meaning: SemanticMeaning

  seo: SemanticSEO

  summary: SemanticSummary
}

/* ============================================================================
🔥 Semantic Runtime
============================================================================ */

export interface SemanticRuntime {

  universes: SemanticUniverse[]

  navigation: SemanticNavigationItem[]

  sidebar: SemanticNavigationItem[]

  discover: SemanticDiscoverRuntime

  meaning: SemanticMeaning

  seo: SemanticSEO

  summary: SemanticSummary

  raw?: any
}