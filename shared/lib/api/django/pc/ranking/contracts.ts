// ============================================================================
// Ranking Contracts V2
// Backend Reality Contract
// ============================================================================

/* ============================================================================
🔥 Meaning
============================================================================ */

export interface RankingMeaning {

  identity?: string
  mission?: string
  user_intent?: string
  meaning_statement?: string
  existence_reason?: string
}

/* ============================================================================
🔥 Presentation
============================================================================ */

export interface RankingPresentation {

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
🔥 SEO
============================================================================ */

export interface RankingSEO {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  schema_jsonld?: any
}

/* ============================================================================
🔥 Product
============================================================================ */

export interface RankingProduct {

  product_id: number

  unique_id: string

  name: string

  maker: string

  price: number

  image_url: string

  semantic_attributes: string[]

  matched_groups: string[]

  reality_scores?: Record<string, number>

  product_type?: string

  primary_workflow?: string | null

  workflow_score?: number

  semantic_score?: number

  workflow_tags?: string[]

  workflows?: any[]

  semantic_labels?: string[]

  adaptive_runtime?: any

  semantic_version?: string

  semantic_authority?: string

  runtime_valid?: boolean
}

/* ============================================================================
🔥 Ranking Data
============================================================================ */

export interface RankingData {

  group_slug: string

  group_name: string

  product_count: number

  products: RankingProduct[]
}

/* ============================================================================
🔥 Runtime
============================================================================ */

export interface SemanticRankingRuntime {

  success?: boolean

  meaning?: RankingMeaning

  presentation?: RankingPresentation

  seo?: RankingSEO

  data: RankingData

  semantic_schema_version?: number

  authority_version?: string

  semantic_authority?: string

  ready?: boolean

  raw?: any
}