// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticTypes.ts

/* =========================================
🔥 Semantic Group Types
========================================= */

export type SemanticGroupType =

  | 'device'
  | 'product_type'
  | 'usage'
  | 'maker'
  | 'gpu'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'pc_feature'
  | 'unknown'

/* =========================================
🔥 Semantic Slug
========================================= */

export type SemanticSlug =
  string

/* =========================================
🔥 Parsed Semantic
========================================= */

export type ParsedSemantic = {

  slug: SemanticSlug

  group: SemanticGroupType

  value: string
}

/* =========================================
🔥 Semantic Explanation
========================================= */

export type SemanticExplanation = {

  slug: SemanticSlug

  label: string

  icon?: string
}

/* =========================================
🔥 Semantic Hero Copy
========================================= */

export type SemanticHeroCopy = {

  catch: string

  sub: string
}

/* =========================================
🔥 Semantic Hero Policy
========================================= */

export type SemanticHeroPolicy = {

  accent: string

  cta: string

  emphasis: string
}

/* =========================================
🔥 Semantic Render Config
========================================= */

export type SemanticRenderConfig = {

  variant: string

  className: string
}

/* =========================================
🔥 Semantic Registry
========================================= */

export type SemanticRegistry<
  T
> = Record<
  string,
  T
>

/* =========================================
🔥 Semantic Grouped Result
========================================= */

export type GroupedSemanticResult =
  Record<
    SemanticGroupType,
    ParsedSemantic[]
  >

/* =========================================
🔥 Recommendation Reason
========================================= */

export type RecommendationReason = {

  matched_attributes:
    SemanticSlug[]

  similarity_score?:
    number
}

