// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/types/ontology.ts

/* =========================================
🔥 Semantic Role
========================================= */

export type SemanticRole =

  | 'primary'
  | 'secondary'
  | 'highlight'
  | 'related'
  | 'ranking'
  | string

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  /* ======================================
  🔥 Identity
  ====================================== */

  name?: string

  slug?: string

  /* ======================================
  🔥 Semantic
  ====================================== */

  semantic_role?: SemanticRole

  semantic_weight?: number

  icon?: string

  color?: string

  /* ======================================
  🔥 Metrics
  ====================================== */

  count?: number

  /* ======================================
  🔥 Presentation
  ====================================== */

  description?: string

  href?: string
}

/* =========================================
🔥 Semantic Group
========================================= */

export type SemanticGroup = {

  key: string

  label: string

  totalAttributes: number

  totalProducts: number

  attributes: SemanticAttribute[]
}

/* =========================================
🔥 Ontology Runtime
========================================= */

export type SemanticOntologyRuntime = {

  [group: string]:

    SemanticAttribute[]
}