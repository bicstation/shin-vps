// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/types/semantic.ts
// ============================================================================

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Semantic Runtime Types
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic runtime frontend typing
 *   - ontology rendering contracts
 *   - semantic metadata structure
 *
 * IMPORTANT:
 *   - backend owns semantic authority
 *   - frontend renders semantic metadata only
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Semantic Metadata
============================================================================ */

export type SemanticMetadata = {

  /* ==========================================================================
  🔥 Identity
  ========================================================================== */

  id?: number

  slug?: string

  label?: string

  name?: string

  /* ==========================================================================
  🔥 Semantic Runtime
  ========================================================================== */

  semantic_role?: string

  semantic_weight?: number

  /* ==========================================================================
  🔥 Visual Metadata
  ========================================================================== */

  icon?: string

  color?: string
}

/* ============================================================================
🔥 Semantic Group
============================================================================ */

export type SemanticGroup = {

  key: string

  title?: string

  description?: string

  attributes?: SemanticMetadata[]
}

/* ============================================================================
🔥 Grouped Attributes
============================================================================ */

export type GroupedAttributes = Record<
  string,
  SemanticMetadata[]
>

/* ============================================================================
🔥 Semantic Chip
============================================================================ */

export type SemanticChip = {

  slug?: string

  label?: string

  icon?: string

  color?: string
}

/* ============================================================================
🔥 Semantic Translation
============================================================================ */

export type SemanticTranslation = {

  slug: string

  label: string
}

/* ============================================================================
🔥 Semantic Runtime
============================================================================ */

export type SemanticRuntime = {

  grouped_attributes?: GroupedAttributes

  semantic_role?: string

  semantic_weight?: number
}

/* ============================================================================
🔥 Export
============================================================================ */

export default SemanticMetadata