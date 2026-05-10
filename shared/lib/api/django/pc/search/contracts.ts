// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/search/contracts.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Semantic Query
========================================= */

export type SemanticSearchQuery = {

  // ======================================
  // Semantic Attributes
  // ======================================

  gpu?: string

  cpu?: string

  usage?: string

  maker?: string

  memory?: string

  storage?: string

  device?: string

  // ======================================
  // Search
  // ======================================

  keyword?: string

  // ======================================
  // Pagination
  // ======================================

  page?: number

  limit?: number
}

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  id?: number

  type?: string

  slug?: string

  name?: string

  semantic_role?:
    | 'highlight'
    | 'primary'
    | 'secondary'
    | 'supportive'

  semantic_weight?: number

  icon?: string

  color?: string
}

/* =========================================
🔥 Semantic Product
========================================= */

export type SemanticProduct = {

  id?: number

  unique_id?: string

  name?: string

  maker?: string

  price?: number

  image_url?: string

  description?: string

  url?: string

  affiliate_url?: string

  // ======================================
  // Spec
  // ======================================

  cpu_model?: string

  gpu_model?: string

  memory_gb?: number

  storage_gb?: number

  // ======================================
  // Score
  // ======================================

  spec_score?: number

  score_cpu?: number

  score_gpu?: number

  score_ai?: number

  score_cost?: number

  score_portable?: number

  // ======================================
  // Semantic
  // ======================================

  attributes?:
    SemanticAttribute[]

  grouped_attributes?:
    Record<
      string,
      SemanticAttribute[]
    >

  semantic_schema_version?:
    number
}

/* =========================================
🔥 Semantic Search Response
========================================= */

export type SemanticSearchResponse<T> = {

  results: T[]

  total?: number

  semantic_schema_version?:
    number
}