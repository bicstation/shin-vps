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

    itemList?: any

    breadcrumbList?: any

    faqPage?: any

    collectionPage?: any
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
  🔥 Normalize
  ====================================== */

  return {

    success:
      json?.success
      || false,

    products:

      Array.isArray(
        json?.products
      )

        ? json.products

        : [],

    semantic:
      json?.semantic
      || {},

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
        json?.seo?.open_graph
        || {},

      twitter:
        json?.seo?.twitter
        || {},
    },

    faq:

      Array.isArray(
        json?.faq
      )

        ? json.faq

        : [],

    breadcrumbs:

      Array.isArray(
        json?.breadcrumbs
      )

        ? json.breadcrumbs

        : [],

    schemas: {

      itemList:
        json?.schemas?.item_list
        || null,

      breadcrumbList:
        json?.schemas?.breadcrumb_list
        || null,

      faqPage:
        json?.schemas?.faq_page
        || null,

      collectionPage:
        json?.schemas?.collection_page
        || null,
    },

    ui:
      json?.ui
      || {},
  }
}