// /shared/types/semantic.ts

export type SemanticAttribute = {
  id?: number

  slug: string
  name: string
  type: string

  semantic_role?: string
  semantic_weight?: number

  icon?: string
  color?: string
}