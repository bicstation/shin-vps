// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/contracts/finder.contract.ts

/* =========================================
🔥 Semantic Attribute
========================================= */

export type FinderSemanticAttribute = {

  slug: string

  name: string

  attr_type?: string

  semantic_role?: string

  semantic_weight?: number
}

/* =========================================
🔥 Grouped Attributes
========================================= */

export type FinderGroupedAttributes =
  Record<
    string,
    FinderSemanticAttribute[]
  >

/* =========================================
🔥 Finder Product
========================================= */

export type FinderProduct = {

  unique_id: string

  name: string

  maker?: string

  price?: number

  image_url?: string

  score?: number

  semantic_score?: number

  matched_attributes?:
    string[]

  grouped_attributes?:
    FinderGroupedAttributes
}

/* =========================================
🔥 Finder Response
========================================= */

export type FinderResponse = {

  success?: boolean

  count?: number

  products:
    FinderProduct[]

  semantic_schema_version?:
    string
}

/* =========================================
🔥 Finder Query
========================================= */

export type FinderQuery = {

  usage?: string

  maker?: string

  gpu?: string

  cpu?: string

  memory?: string

  storage?: string

  max_price?: number

  device?: string
}

