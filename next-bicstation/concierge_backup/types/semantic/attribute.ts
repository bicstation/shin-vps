// /app/concierge/types/semantic/attribute.ts

/* =========================================
🔥 SEMANTIC ATTRIBUTE TYPES
========================================= */

export type SemanticRole = 'primary' | 'secondary' | 'highlight' | 'supportive'

export type SemanticAttribute = {
  id?: number
  name: string
  slug: string
  attr_type?: string
  attr_type_display?: string
  description?: string
  icon?: string
  color?: string
  count?: number
  order?: number
  semantic_role?: SemanticRole
  semantic_weight?: number
}