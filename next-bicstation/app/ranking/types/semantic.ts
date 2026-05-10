// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/types/semantic.ts

/* =========================================
🔥 Semantic Role
========================================= */

export type SemanticRole =

  | 'highlight'
  | 'primary'
  | 'secondary'
  | 'supportive'

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  /* =====================================
  Identity
  ===================================== */

  id?: number

  name: string

  slug: string

  href?: string

  /* =====================================
  Type
  ===================================== */

  attr_type?: string

  attr_type_display?: string

  /* =====================================
  UI
  ===================================== */

  description?: string

  icon?: string

  color?: string

  /* =====================================
  Stats
  ===================================== */

  count?: number

  order?: number

  /* =====================================
  Semantic
  ===================================== */

  semantic_role?: SemanticRole

  semantic_weight?: number
}

/* =========================================
🔥 Semantic Group
========================================= */

export type SemanticGroup = {

  key: string

  label: string

  title: string

  description?: string

  href?: string

  items: SemanticAttribute[]
}

/* =========================================
🔥 Semantic Navigation
========================================= */

export type SemanticNavigation = {

  groups: SemanticGroup[]
}

/* =========================================
🔥 Semantic Payload
========================================= */

export type SemanticPayload = {

  semantic_schema_version?: number

  attributes?: SemanticAttribute[]

  grouped_attributes?: Record<
    string,
    SemanticAttribute[]
  >
}

/* =========================================
🔥 Semantic Finder Query
========================================= */

export type SemanticFinderQuery = {

  usage?: string

  gpu?: string

  cpu?: string

  maker?: string

  memory?: string

  storage?: string

  resolution?: string

  panel?: string

  workload?: string

  ai?: string
}

/* =========================================
🔥 Semantic Recommendation
========================================= */

export type SemanticRecommendation = {

  semantic_score?: number

  confidence?: number

  reasoning?: string
}

/* =========================================
🔥 Semantic Card Props
========================================= */

export type SemanticCardProps = {

  item: SemanticAttribute
}

/* =========================================
🔥 Semantic Section Props
========================================= */

export type SemanticSectionProps = {

  group: SemanticGroup
}

/* =========================================
🔥 Ranking Hero Props
========================================= */

export type RankingHeroProps = {

  title?: string

  description?: string

  semanticLabels?: string[]
}

/* =========================================
🔥 Finder CTA Props
========================================= */

export type FinderCTAProps = {

  title?: string

  description?: string

  href?: string

  semanticKeywords?: string[]
}