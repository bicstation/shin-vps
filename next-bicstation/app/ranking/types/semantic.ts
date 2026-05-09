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

  id?: number

  attr_type?: string

  attr_type_display?: string

  name: string

  slug: string

  description?: string

  icon?: string

  color?: string

  count?: number

  order?: number

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
}

/* =========================================
🔥 Semantic Recommendation
========================================= */

export type SemanticRecommendation = {

  semantic_score?: number

  confidence?: number

  reasoning?: string
}
