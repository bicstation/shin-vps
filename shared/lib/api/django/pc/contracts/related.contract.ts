// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/contracts/related.contract.ts

/* =========================================
🔥 Semantic Attribute
========================================= */

export type RelatedSemanticAttribute = {

  slug: string

  name: string

  attr_type?: string

  semantic_role?: string

  semantic_weight?: number
}

/* =========================================
🔥 Grouped Attributes
========================================= */

export type RelatedGroupedAttributes =
  Record<
    string,
    RelatedSemanticAttribute[]
  >

/* =========================================
🔥 Related Product
========================================= */

export type RelatedProduct = {

  unique_id: string

  name: string

  maker?: string

  image_url?: string

  price?: number

  score?: number

  semantic_score?: number

  similarity_score?: number

  matched_attributes?:
    string[]

  grouped_attributes?:
    RelatedGroupedAttributes

  attributes?:
    RelatedSemanticAttribute[]
}

/* =========================================
🔥 Related Metadata
========================================= */

export type RelatedMetadata = {

  source_product_id?:
    string

  semantic_schema_version?:
    string
}

/* =========================================
🔥 Related Response
========================================= */

export type RelatedResponse = {

  success?: boolean

  count?: number

  metadata?:
    RelatedMetadata

  products:
    RelatedProduct[]
}

/* =========================================
🔥 Related Query
========================================= */

export type RelatedQuery = {

  unique_id: string

  limit?: number
}

