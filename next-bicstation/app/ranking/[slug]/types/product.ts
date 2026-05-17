// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/types/product.ts
// ============================================================================

/* ============================================================================
🔥 Product Semantic Attribute
============================================================================ */

export type ProductSemanticAttribute = {

  slug?: string

  name?: string

  icon?: string

  color?: string

  semantic_role?: string

  semantic_weight?: number

}

/* ============================================================================
🔥 Product Grouped Attributes
============================================================================ */

export type ProductGroupedAttributes =

  Record<
    string,
    ProductSemanticAttribute[]
  >

/* ============================================================================
🔥 Product Runtime
============================================================================ */

export type ProductRuntime = {

  id?: number | string

  slug?: string

  name?: string

  maker?: string

  description?: string

  image_url?: string

  affiliate_url?: string

  price?: number | string

  semantic_role?: string

  semantic_weight?: number

  recommendation_reason?: string

  grouped_attributes?: ProductGroupedAttributes

}

/* ============================================================================
🔥 Product Ranking Runtime
============================================================================ */

export type ProductRankingRuntime = {

  products?: ProductRuntime[]

}