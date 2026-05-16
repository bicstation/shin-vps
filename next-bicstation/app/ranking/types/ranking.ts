// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/types/ranking.ts

/* =========================================
🔥 Product
========================================= */

export type RankingProduct = {

  /* ======================================
  🔥 Identity
  ====================================== */

  id?: number

  unique_id?: string

  name?: string

  maker?: string

  site_prefix?: string

  /* ======================================
  🔥 Pricing
  ====================================== */

  price?: number

  /* ======================================
  🔥 Media
  ====================================== */

  image_url?: string

  thumbnail_url?: string

  /* ======================================
  🔥 URLs
  ====================================== */

  url?: string

  affiliate_url?: string

  /* ======================================
  🔥 Semantic
  ====================================== */

  score?: number

  semantic_role?: string

  semantic_weight?: number

  /* ======================================
  🔥 Specs
  ====================================== */

  cpu?: string

  gpu?: string

  memory?: string

  storage?: string
}

/* =========================================
🔥 Semantic Metadata
========================================= */

export type SemanticMetadata = {

  slug?: string

  title?: string

  description?: string

  semanticRole?: string

  semanticWeight?: number

  icon?: string

  color?: string

  count?: number
}

/* =========================================
🔥 Ranking Insight
========================================= */

export type RankingInsight = {

  title?: string

  description?: string

  icon?: string
}

/* =========================================
🔥 Ranking Stat
========================================= */

export type RankingStat = {

  label: string

  value: string | number

  description?: string
}

/* =========================================
🔥 Related Attribute
========================================= */

export type RelatedAttribute = {

  name?: string

  slug?: string

  href?: string

  description?: string

  semantic_role?: string

  semantic_weight?: number

  count?: number
}

/* =========================================
🔥 FAQ
========================================= */

export type RankingFAQ = {

  question: string

  answer: string
}