// /home/maya/shin-dev/shin-vps/shared/lib/navigation/navigationTypes.ts

/* =========================================
🔥 Semantic Role
========================================= */

export type SemanticRole =

  | 'highlight'
  | 'primary'
  | 'secondary'
  | 'supportive'

/* =========================================
🔥 Navigation Item
========================================= */

export type SemanticNavigationItem = {

  label: string

  slug: string

  href: string

  description?: string

  icon?: string

  image?: string

  count?: number

  semantic_role?: SemanticRole

  semantic_weight?: number

  order?: number
}

/* =========================================
🔥 Navigation Group
========================================= */

export type SemanticNavigationGroup = {

  key: string

  type: string

  title: string

  description?: string

  items:
    SemanticNavigationItem[]
}

/* =========================================
🔥 Semantic Navigation
========================================= */

export type SemanticNavigation = {

  groups:
    SemanticNavigationGroup[]
}