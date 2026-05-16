// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/types/runtime.ts

/* =========================================
🔥 Types
========================================= */

import type {
  SemanticAttribute,
} from './ontology'

import type {
  RankingProduct,
  RankingFAQ,
} from './ranking'

/* =========================================
🔥 SEO Runtime
========================================= */

export type RuntimeSEO = {

  title?: string

  description?: string

  canonical?: string

  keywords?: string[]

  openGraph?: any

  twitter?: any
}

/* =========================================
🔥 Schema Runtime
========================================= */

export type RuntimeSchemas = {

  itemList?: any

  breadcrumbList?: any

  faqPage?: any

  collectionPage?: any
}

/* =========================================
🔥 Breadcrumb
========================================= */

export type RuntimeBreadcrumb = {

  name?: string

  href?: string
}

/* =========================================
🔥 Semantic Runtime
========================================= */

export type SemanticRuntime = {

  slug?: string

  name?: string

  title?: string

  description?: string

  semantic_role?: string

  semantic_weight?: number

  icon?: string

  color?: string

  count?: number
}

/* =========================================
🔥 Ranking Runtime
========================================= */

export type SemanticRankingRuntime = {

  success?: boolean

  /* ======================================
  🔥 Products
  ====================================== */

  products?: RankingProduct[]

  /* ======================================
  🔥 Semantic
  ====================================== */

  semantic?: SemanticRuntime

  /* ======================================
  🔥 SEO
  ====================================== */

  seo?: RuntimeSEO

  /* ======================================
  🔥 FAQ
  ====================================== */

  faq?: RankingFAQ[]

  /* ======================================
  🔥 Breadcrumbs
  ====================================== */

  breadcrumbs?: RuntimeBreadcrumb[]

  /* ======================================
  🔥 Schemas
  ====================================== */

  schemas?: RuntimeSchemas

  /* ======================================
  🔥 Related Rankings
  ====================================== */

  related_rankings?: SemanticAttribute[]

  /* ======================================
  🔥 UI Runtime
  ====================================== */

  ui?: any
}

/* =========================================
🔥 Ontology Runtime
========================================= */

export type SemanticOntologyRuntime = {

  [group: string]:

    SemanticAttribute[]
}