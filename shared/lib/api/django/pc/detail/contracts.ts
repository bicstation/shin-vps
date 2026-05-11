// shared/lib/api/django/pc/detail/contracts.ts

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  name: string

  slug: string

  icon?: string

  color?: string
}

/* =========================================
🔥 PC Product
========================================= */

export type PCProduct = {

  /* =====================================
  Identity
  ===================================== */

  unique_id: string

  /* =====================================
  Basic
  ===================================== */

  name: string

  maker?: string

  price?: number

  image_url?: string

  url?: string

  /* =====================================
  Specs
  ===================================== */

  cpu?: string

  gpu?: string

  memory?: string

  storage?: string

  /* =====================================
  Semantic
  ===================================== */

  semantic_score?: number

  semantic_role?: string

  recommendation_reason?: string

  confidence?: number

  grouped_attributes?: {

    usage?: SemanticAttribute[]

    gpu?: SemanticAttribute[]

    maker?: SemanticAttribute[]
  }
}

/* =========================================
🔥 Detail Response
========================================= */

export type PCDetailResponse = {

  success: boolean

  product: PCProduct
}