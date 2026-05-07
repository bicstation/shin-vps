// /shared/types/semantic.ts

/* =========================================
🔥 Semantic Role
========================================= */

export type SemanticRole =

  | 'highlight'
  | 'primary'
  | 'secondary'
  | 'supportive'

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  // -------------------------------------
  // identity
  // -------------------------------------
  id?: number

  slug?: string

  name?: string

  // -------------------------------------
  // backend canonical
  // -------------------------------------
  attr_type?: string

  // -------------------------------------
  // legacy fallback
  // -------------------------------------
  type?: string

  // -------------------------------------
  // ordering
  // -------------------------------------
  order?: number

  // -------------------------------------
  // semantic metadata
  // -------------------------------------
  semantic_role?: SemanticRole

  /**
   * backend authority:
   * 0.0 ~ 1.0
   */
  semantic_weight?: number

  // -------------------------------------
  // visual metadata
  // -------------------------------------
  icon?: string

  color?: string
}

/* =========================================
🔥 Grouped Attributes
========================================= */

export type GroupedAttributes = Record<
  string,
  SemanticAttribute[]
>

/* =========================================
🔥 Semantic Payload
========================================= */

export type SemanticPayload = {

  semantic_schema_version?: number

  attributes?: SemanticAttribute[]

  grouped_attributes?: GroupedAttributes
}
