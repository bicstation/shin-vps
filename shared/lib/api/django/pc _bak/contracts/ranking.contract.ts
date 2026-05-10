// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/contracts/ranking.contract.ts

/* =========================================
🔥 Semantic Attribute
========================================= */

export type RankingSemanticAttribute = {

  slug: string

  name: string

  attr_type?: string

  semantic_role?: string

  semantic_weight?: number
}

/* =========================================
🔥 Grouped Attributes
========================================= */

export type RankingGroupedAttributes =
  Record<
    string,
    RankingSemanticAttribute[]
  >

/* =========================================
🔥 Ranking Product
========================================= */

export type RankingProduct = {

  unique_id: string

  name: string

  maker?: string

  image_url?: string

  price?: number

  score?: number

  semantic_score?: number

  matched_attributes?:
    string[]

  grouped_attributes?:
    RankingGroupedAttributes

  attributes?:
    RankingSemanticAttribute[]
}

/* =========================================
🔥 Ranking Metadata
========================================= */

export type RankingMetadata = {

  type?: string

  title?: string

  description?: string

  semantic_schema_version?:
    string
}

/* =========================================
🔥 Ranking Response
========================================= */

export type RankingResponse = {

  success?: boolean

  count?: number

  metadata?:
    RankingMetadata

  products:
    RankingProduct[]
}

/* =========================================
🔥 Ranking Query
========================================= */

export type RankingQuery = {

  type?: string

  maker?: string

  gpu?: string

  usage?: string

  device?: string

  max_price?: number
}

