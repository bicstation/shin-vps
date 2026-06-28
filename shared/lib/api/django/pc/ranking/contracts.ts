/* ============================================================================
🔥 Ranking Meaning
============================================================================ */

export interface RankingMeaning {

  identity?: string

  mission?: string

  user_intent?: string

  meaning_statement?: string

  existence_reason?: string
}

/* ============================================================================
🔥 Presentation Runtime
============================================================================ */

export interface PresentationRuntime {

  slug?: string

  name?: string

  title?: string

  subtitle?: string

  description?: string

  seo_title?: string

  seo_description?: string

  canonical_path?: string

  schema_type?: string

  icon_key?: string

  theme_key?: string

  color_key?: string

  og_title?: string

  og_description?: string

  og_image?: string

  priority?: string

  visibility?: string

  is_adult?: string
}

/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

export interface RankingRuntime {

  count?: number

  page?: number

  page_size?: number

  has_next?: boolean
}

/* ============================================================================
🔥 Semantic Ranking Runtime
============================================================================ */

export interface SemanticRankingRuntime {

  /* ========================================================================
  Runtime Status
  ======================================================================== */

  success?: boolean

  /* ========================================================================
  Meaning Layer
  ======================================================================== */

  meaning?: RankingMeaning

  presentation?: PresentationRuntime

  seo?: RankingSEO

  /* ========================================================================
  Ranking Runtime
  ======================================================================== */

  ranking?: RankingCollection

  runtime?: RankingRuntime

  /**
   * Canonical Frontend Projection
   */

  products?: RankingProduct[]

  /* ========================================================================
  Semantic Runtime
  ======================================================================== */

  semantic_runtime?: SemanticRuntime

  adaptive_runtime?: AdaptiveRuntime

  semantic_labels?: string[]

  workflow_tags?: string[]

  grouped_attributes?:
    Record<
      string,
      SemanticAttribute[]
    >

  semantic_graph?: any[]

  render_hints?:
    Record<string, any>

  /* ========================================================================
  SEO Extensions
  ======================================================================== */

  faq?: any[]

  breadcrumbs?: any[]

  schemas?: {

    itemSchema?: any

    breadcrumbSchema?: any

    faqSchema?: any

    collectionSchema?: any
  }

  ui?: any

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