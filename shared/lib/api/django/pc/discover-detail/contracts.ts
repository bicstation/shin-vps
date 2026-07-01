// ============================================================================
// Discover Detail Runtime Contracts V2
// ============================================================================

/* ============================================================================
🔥 Meaning Layer
============================================================================ */

export interface DiscoverDetailMeaning {

  identity?: string

  mission?: string

  user_intent?: string

  meaning_statement?: string

  existence_reason?: string
}

/* ============================================================================
🔥 Presentation Layer
============================================================================ */

export interface DiscoverDetailPresentation {

  slug?: string

  name?: string

  title?: string

  subtitle?: string

  description?: string

  seo_title?: string

  seo_description?: string

  canonical_path?: string

  schema_type?: string

  icon_key?: string

  theme_key?: string

  color_key?: string

  og_title?: string

  og_description?: string

  og_image?: string

  priority?: string

  visibility?: string

  is_adult?: string
}

/* ============================================================================
🔥 SEO Layer
============================================================================ */

export interface DiscoverDetailSEO {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  schema_jsonld?: any
}

/* ============================================================================
🔥 Attribute
============================================================================ */

export interface DiscoverDetailAttribute {

  type?: string

  name?: string

  slug?: string

  title?: string

  description?: string

  order?: string

  is_adult?: string

  semantic_role?: string

  semantic_weight?: string

  icon?: string

  color?: string

  is_ranking_enabled?: string
}

/* ============================================================================
🔥 Sample Product
============================================================================ */

export interface DiscoverDetailSampleProduct {

  unique_id: string

  name: string

  maker?: string

  price?: number

  image_url?: string
}

/* ============================================================================
🔥 Data Layer
============================================================================ */

export interface DiscoverDetailData {

  group_slug: string

  group_name?: string

  type?: string

  parent_group?: string

  icon?: string

  color?: string

  sort_order?: string

  attribute?: DiscoverDetailAttribute

  product_count?: number

  aliases: string[]

  related_groups: string[]

  sample_products: DiscoverDetailSampleProduct[]
}

/* ============================================================================
🔥 Discover Detail Runtime
============================================================================ */

export interface DiscoverDetailRuntime {

  /* =========================
     Runtime Status
  ========================= */

  found: boolean

  success?: boolean

  /* =========================
     Meaning
  ========================= */

  meaning?: DiscoverDetailMeaning

  presentation?: DiscoverDetailPresentation

  seo?: DiscoverDetailSEO

  /* =========================
     Data
  ========================= */

  data: DiscoverDetailData

  /* =========================
     Runtime Authority
  ========================= */

  semantic_schema_version?: number

  authority_version?: string

  semantic_authority?: string

  ready?: boolean

  /* =========================
     Raw Backup
  ========================= */

  raw?: any
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type DiscoverDetailRuntimeResponse =
  DiscoverDetailRuntime