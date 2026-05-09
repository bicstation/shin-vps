// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/types/ranking.ts

/* =========================================
🔥 Semantic Role
========================================= */

export type SemanticRole =

  | 'highlight'
  | 'primary'
  | 'secondary'
  | 'supportive'

/* =========================================
🔥 Semantic Metadata
========================================= */

export type SemanticMetadata = {

  title: string

  description: string

  icon?: string

  semantic_role?: SemanticRole

  semantic_weight?: number
}

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  name?: string

  slug?: string

  icon?: string

  semantic_role?: SemanticRole

  semantic_weight?: number

  count?: number

  [key: string]: any
}

/* =========================================
🔥 Grouped Attributes
========================================= */

export type GroupedAttributes =
  Record<
    string,
    SemanticAttribute[]
  >

/* =========================================
🔥 Product
========================================= */

export type RankingProduct = {

  id?: number

  unique_id?: string

  slug?: string

  name?: string

  maker?: string

  image_url?: string

  price?: number

  score?: number

  grouped_attributes?:
    GroupedAttributes

  semantic_schema_version?: string

  semantic_score?: number

  semantic_role?: SemanticRole

  [key: string]: any
}

/* =========================================
🔥 Semantic Group Map
========================================= */

export type SemanticGroupMap =
  Record<
    string,
    SemanticAttribute[]
  >

/* =========================================
🔥 Ranking Page Props
========================================= */

export type RankingPageProps = {

  params: {
    type: string
  }
}

/* =========================================
🔥 Semantic Flow Props
========================================= */

export type RankingFlowProps = {

  type: string

  products:
    RankingProduct[]
}

/* =========================================
🔥 Hero Props
========================================= */

export type HeroSectionProps = {

  type: string

  topProduct:
    RankingProduct | null
}

/* =========================================
🔥 Grid Props
========================================= */

export type GridSectionProps = {

  products:
    RankingProduct[]
}

/* =========================================
🔥 Recommendation Props
========================================= */

export type RecommendationProps = {

  type: string
}
