// /shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime.ts

/* =========================================
🔥 Utils
========================================= */

import {
  buildEndpoint,
} from '../utils/buildEndpoint'

import {
  safeFetch,
} from '../utils/safeFetch'

/* =========================================
🔥 Types
========================================= */

export type SemanticRankingRuntime = {

  success?: boolean

  products?: any[]

  semantic?: any

  seo?: {

    title?: string

    description?: string

    canonical?: string

    keywords?: string[]

    openGraph?: any

    twitter?: any
  }

  faq?: any[]

  breadcrumbs?: any[]

  schemas?: {

    itemSchema?: any

    breadcrumbSchema?: any

    faqSchema?: any

    collectionSchema?: any
  }

  ui?: any
}

/* =========================================
🔥 Fetch Semantic Ranking Runtime
========================================= */

export async function
fetchSemanticRankingRuntime(

  slug = 'score'

): Promise<SemanticRankingRuntime> {

  /* ======================================
  🔥 Endpoint
  ====================================== */

  const endpoint =

    buildEndpoint(

      `/general/pc-products/ranking/${slug}/`

    )

  /* ======================================
  🔥 Fetch
  ====================================== */

  const json =

    await safeFetch(
      endpoint
    )

  /* ======================================
  🔥 Runtime Debug
  ====================================== */

  console.log(
    '[Ranking Runtime URL]',
    endpoint
  )

  console.log(
    '🔥 RAW JSON',
    JSON.stringify(
      json,
      null,
      2
    )
  )

  /* ======================================
  🔥 Normalize
  ====================================== */

  return {

    /* ====================================
    🔥 Success
    ==================================== */

    success:
      json?.success
      || false,

    /* ====================================
    🔥 Products
    ==================================== */

    products:

      Array.isArray(
        json?.products
      )

        ? json.products

        : [],

    /* ====================================
    🔥 Semantic
    ==================================== */

    semantic:
      json?.semantic
      || {},

    /* ====================================
    🔥 SEO
    ==================================== */

    seo: {

      title:
        json?.seo?.title,

      description:
        json?.seo?.description,

      canonical:
        json?.seo?.canonical,

      keywords:

        Array.isArray(
          json?.seo?.keywords
        )

          ? json.seo.keywords

          : [],

      openGraph:

        json?.seo?.openGraph
        ||
        json?.seo?.open_graph
        ||
        {},

      twitter:

        json?.seo?.twitter
        || {},
    },

    /* ====================================
    🔥 FAQ
    ==================================== */

    faq:

      Array.isArray(
        json?.faq
      )

        ? json.faq

        : [],

    /* ====================================
    🔥 Breadcrumbs
    ==================================== */

    breadcrumbs:

      Array.isArray(
        json?.breadcrumbs
      )

        ? json.breadcrumbs

        : [],

    /* ====================================
    🔥 Schemas
    ==================================== */

    schemas: {

      itemSchema:

        json?.schemas?.itemSchema
        ||
        json?.schemas?.item_schema
        ||
        json?.schemas?.itemList
        ||
        json?.schemas?.item_list
        ||
        null,

      breadcrumbSchema:

        json?.schemas?.breadcrumbSchema
        ||
        json?.schemas?.breadcrumb_schema
        ||
        json?.schemas?.breadcrumbList
        ||
        json?.schemas?.breadcrumb_list
        ||
        null,

      faqSchema:

        json?.schemas?.faqSchema
        ||
        json?.schemas?.faq_schema
        ||
        json?.schemas?.faqPage
        ||
        json?.schemas?.faq_page
        ||
        null,

      collectionSchema:

        json?.schemas?.collectionSchema
        ||
        json?.schemas?.collection_schema
        ||
        json?.schemas?.collectionPage
        ||
        json?.schemas?.collection_page
        ||
        null,
    },

    /* ====================================
    🔥 UI
    ==================================== */

    ui:
      json?.ui
      || {},
  }
}