// /types/finder.ts

/* =========================================
🔥 Finder Purpose
========================================= */

export type FinderPurpose =

  | 'gaming'
  | 'creator'
  | 'business'
  | 'ai'

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  id?: number

  type?: string

  name?: string

  slug?: string

  semantic_role?: string

  semantic_weight?: number

  icon?: string

  color?: string
}

/* =========================================
🔥 Grouped Attributes
========================================= */

export type GroupedAttributes = Record<
  string,
  SemanticAttribute[]
>

/* =========================================
🔥 Radar Chart
========================================= */

export type RadarChartValue = {

  label: string

  value: number
}

/* =========================================
🔥 Product
========================================= */

export type FinderProduct = {

  /* =====================================
  Identity
  ===================================== */

  unique_id?: string

  name?: string

  maker?: string

  description?: string

  /* =====================================
  Media
  ===================================== */

  image_url?: string

  /* =====================================
  Price
  ===================================== */

  price?: number

  /* =====================================
  Specs
  ===================================== */

  cpu_model?: string

  gpu_model?: string

  memory_gb?: number

  storage_gb?: number

  /* =====================================
  Scores
  ===================================== */

  spec_score?: number

  semantic_score?: number

  recommendation_score?: number

  confidence?: number

  /* =====================================
  Semantic
  ===================================== */

  attributes?: SemanticAttribute[]

  grouped_attributes?: GroupedAttributes

  semantic_schema_version?: number

  /* =====================================
  AI
  ===================================== */

  ai_summary?: string

  recommendation_reasoning?: string[]

  recommendation_summary?: string
}

/* =========================================
🔥 Finder API Response
========================================= */

export type FinderApiResponse = {

  results?: FinderProduct[]

  products?: FinderProduct[]

  semantic_schema_version?: number
}

/* =========================================
🔥 Finder Query
========================================= */

export type FinderQuery = {

  purpose?: FinderPurpose

  usage?: string

  gpu?: string

  cpu?: string

  maker?: string

  memory?: string

  storage?: string

  max_price?: number
}

/* =========================================
🔥 Finder State
========================================= */

export type FinderState = {

  purpose: FinderPurpose

  budget: number

  loading: boolean

  results: FinderProduct[]

  featuredProduct?: FinderProduct | null

  semanticUsage: string
}

/* =========================================
🔥 Finder Recommendation
========================================= */

export type FinderRecommendation = {

  product: FinderProduct

  recommendation_score: number

  confidence: number

  reasoning: string[]
}

/* =========================================
🔥 Hero Props
========================================= */

export type HeroSectionProps = {

  purpose: FinderPurpose

  semanticUsage: string

  semanticDescription: string
}

/* =========================================
🔥 Intent Props
========================================= */

export type IntentSectionProps = {

  value: FinderPurpose

  onChange:
    (
      value: FinderPurpose
    ) => void
}

/* =========================================
🔥 Budget Props
========================================= */

export type BudgetSectionProps = {

  value: number

  onChange:
    (
      value: number
    ) => void
}

/* =========================================
🔥 Results Props
========================================= */

export type ResultsSectionProps = {

  results: FinderProduct[]

  semanticUsage: string
}

/* =========================================
🔥 Recommendation Props
========================================= */

export type RecommendationSectionProps = {

  purpose: FinderPurpose

  semanticUsage: string

  featuredProduct?: FinderProduct | null
}

/* =========================================
🔥 CTA Props
========================================= */

export type CTASectionProps = {

  purpose: FinderPurpose

  semanticUsage: string
}