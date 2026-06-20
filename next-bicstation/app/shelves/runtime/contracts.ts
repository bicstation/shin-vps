// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/runtime/contracts.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Product Runtime Contracts
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic runtime response contracts
 *   - shelf runtime typing
 *   - frontend runtime authority structure
 *
 * IMPORTANT:
 *   - semantic truth is backend authority
 *   - frontend consumes runtime contracts only
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Semantic Attribute
============================================================================ */

export type SemanticAttribute = {

  id?: number

  slug?: string

  label?: string

  name?: string

  semantic_role?: string

  semantic_weight?: number

  icon?: string

  color?: string
}

/* ============================================================================
🔥 Grouped Attributes
============================================================================ */

export type GroupedAttributes = Record<
  string,
  SemanticAttribute[]
>

/* ============================================================================
🔥 Product Runtime
============================================================================ */

export type ProductRuntime = {

  id?: number

  unique_id?: string

  slug?: string

  name?: string

  image_url?: string

  recommendation_reason?: string

  grouped_attributes?: GroupedAttributes
}

/* ============================================================================
🔥 Shelf Runtime
============================================================================ */

export type ShelfRuntime = {

  attribute: string

  title: string

  description: string

  products: ProductRuntime[]
}

/* ============================================================================
🔥 Product Runtime Response
============================================================================ */

export type ProductRuntimeResponse = {

  success?: boolean

  count?: number

  products?: ProductRuntime[]
}

/* ============================================================================
🔥 Semantic Shelf Runtime Response
============================================================================ */

export type SemanticShelfRuntimeResponse = {

  success?: boolean

  shelf?: string

  count?: number

  products?: ProductRuntime[]
}