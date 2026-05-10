// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/contracts/semantic.contract.ts

// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/contracts/semantic.contract.ts

/* =========================================
🔥 Semantic Attribute
========================================= */

export type SemanticAttribute = {

  slug: string

  name: string

  attr_type?: string

  semantic_role?: string

  semantic_weight?: number

  icon?: string

  color?: string
}

/* =========================================
🔥 Semantic Group
========================================= */

export type SemanticGroup = {

  key: string

  label: string

  description?: string

  attributes:
    SemanticAttribute[]
}

/* =========================================
🔥 Grouped Attributes
========================================= */

export type GroupedSemanticAttributes =
  Record<
    string,
    SemanticAttribute[]
  >

/* =========================================
🔥 Semantic Navigation
========================================= */

export type SemanticNavigation = {

  groups:
    SemanticGroup[]

  semantic_schema_version?:
    string
}

/* =========================================
🔥 Semantic Metadata
========================================= */

export type SemanticMetadata = {

  semantic_schema_version?:
    string

  grouped_attributes?:
    GroupedSemanticAttributes
}

/* =========================================
🔥 Semantic Registry
========================================= */

export type SemanticRegistry = {

  [key: string]:
    SemanticAttribute[]
}

/* =========================================
🔥 Semantic Axis
========================================= */

export type SemanticAxis =

  | 'device'
  | 'usage'
  | 'maker'
  | 'gpu'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'pc_feature'
  | 'product_type'
  | 'unknown'

