// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/types/semantic.ts

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
🔥 Semantic Runtime
========================================= */

export type SemanticRuntime = {

  /* ======================================
  🔥 Identity
  ====================================== */

  slug?: string

  name?: string

  title?: string

  description?: string

  /* ======================================
  🔥 Semantic
  ====================================== */

  semantic_role?: SemanticRole

  semantic_weight?: number

  /* ======================================
  🔥 Visual
  ====================================== */

  icon?: string

  color?: string

  /* ======================================
  🔥 Metrics
  ====================================== */

  count?: number
}

/* =========================================
🔥 Semantic Group Runtime
========================================= */

export type SemanticGroupRuntime = {

  key: string

  label: string

  totalAttributes: number

  totalProducts: number

  attributes: SemanticRuntime[]
}

/* =========================================
🔥 Semantic Insight
========================================= */

export type SemanticInsight = {

  title?: string

  description?: string

  icon?: string
}

/* =========================================
🔥 Semantic Metadata
========================================= */

export type SemanticMetadata = {

  slug?: string

  title?: string

  description?: string

  semanticRole?: SemanticRole

  semanticWeight?: number

  icon?: string

  color?: string

  count?: number
}