// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/types/product.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Product Runtime Types
 * ============================================================================
 *
 * PURPOSE:
 *   - frontend product runtime typing
 *   - semantic runtime renderer contracts
 *   - product discovery structure
 *
 * IMPORTANT:
 *   - semantic authority belongs to backend
 *   - frontend consumes normalized runtime only
 *
 * ============================================================================
 */

import type {
  GroupedAttributes,
} from '../runtime/contracts'

/* ============================================================================
🔥 Product Runtime
============================================================================ */

export type Product = {

  /* ==========================================================================
  🔥 Identity
  ========================================================================== */

  id?: number

  unique_id?: string

  slug?: string

  name?: string

  short_name?: string

  /* ==========================================================================
  🔥 Visual
  ========================================================================== */

  image_url?: string

  thumbnail_url?: string

  /* ==========================================================================
  🔥 Discovery
  ========================================================================== */

  recommendation_reason?: string

  workflow_summary?: string

  semantic_summary?: string

  /* ==========================================================================
  🔥 Semantic Runtime
  ========================================================================== */

  grouped_attributes?: GroupedAttributes

  semantic_role?: string

  semantic_weight?: number

  icon?: string

  color?: string

  /* ==========================================================================
  🔥 Runtime Metadata
  ========================================================================== */

  created_at?: string

  updated_at?: string
}

/* ============================================================================
🔥 Product Card Props
============================================================================ */

export type ProductCardProps = {

  product: Product
}

/* ============================================================================
🔥 Product Shelf Props
============================================================================ */

export type ProductShelfProps = {

  title?: string

  description?: string

  products?: Product[]
}

/* ============================================================================
🔥 Export
============================================================================ */

export default Product