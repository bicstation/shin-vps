// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/types/runtime.ts
// ============================================================================

import type {
  ProductRuntime,
} from './product'

/* ============================================================================
🔥 SEO Runtime
============================================================================ */

export type SEORuntime = {

  title?: string

  description?: string

  keywords?: string[]

  canonical?: string

  og_image?: string

}

/* ============================================================================
🔥 FAQ Runtime
============================================================================ */

export type FAQRuntime = {

  question?: string

  answer?: string

}

/* ============================================================================
🔥 Breadcrumb Runtime
============================================================================ */

export type BreadcrumbRuntime = {

  name?: string

  url?: string

}

/* ============================================================================
🔥 Schema Runtime
============================================================================ */

export type SchemaRuntime = {

  '@context'?: string

  '@type'?: string

  [key: string]: any

}

/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

export type RankingRuntime = {

  seo?: SEORuntime

  faq?: FAQRuntime[]

  breadcrumbs?: BreadcrumbRuntime[]

  schemas?: SchemaRuntime[]

  grouped_attributes?: Record<
    string,
    any
  >

  products?: ProductRuntime[]

}