// shared/lib/api/django/pc/related/contracts.ts

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
🔥 Related Product
========================================= */

export type RelatedProduct = {

  /* =====================================
  Identity
  ===================================== */

  id?: number

  unique_id: string

  /* =====================================
  Basic
  ===================================== */

  name: string

  maker?: string

  image_url?: string

  url?: string

  affiliate_url?: string

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
  Semantic
  ===================================== */

  semantic_score?: number

  semantic_role?: string

  semantic_weight?: number

  recommendation_reason?: string

  confidence?: number

  icon?: string

  color?: string

  /* =====================================
  Attributes
  ===================================== */

  grouped_attributes?: {

    usage?: SemanticAttribute[]

    gpu?: SemanticAttribute[]

    maker?: SemanticAttribute[]
  }

  /* =====================================
  Raw
  ===================================== */

  raw?: any
}

/* =========================================
🔥 Related Response
========================================= */

export type RelatedResponse = {

  success: boolean

  products: RelatedProduct[]
}