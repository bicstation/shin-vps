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

ranking?: {


results?: any[]

total?: number

page?: number

limit?: number


}

semantic_runtime?: any

semantic_labels?: string[]

render_hints?: any

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

raw?: any
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
'🔥 RANKING RUNTIME URL',
endpoint
)

console.log(
'🔥 RANKING RAW JSON',
json
)

/* ======================================
🔥 Empty Guard
====================================== */

if (!json) {


return {

  success: false,

  ranking: {

    results: [],
  },

  raw: null,
}


}

/* ======================================
🔥 Minimal Semantic Normalize
====================================== */

return {


// ====================================
// Preserve Raw Payload
// ====================================

...json,

// ====================================
// Success
// ====================================

success:
  json?.success
  || false,

// ====================================
// Ranking Runtime
// ====================================

ranking: {

  results:

    Array.isArray(
      json?.ranking?.results
    )

      ? json.ranking.results

      : [],

  total:
    json?.ranking?.total
    || 0,

  page:
    json?.ranking?.page
    || 1,

  limit:
    json?.ranking?.limit
    || 0,
},

// ====================================
// Semantic Runtime
// ====================================

semantic_runtime:

  json?.semantic_runtime
  || {},

semantic_labels:

  Array.isArray(
    json?.semantic_labels
  )

    ? json.semantic_labels

    : [],

render_hints:

  json?.render_hints
  || {},

// ====================================
// SEO
// ====================================

seo:

  json?.seo
  || {},

// ====================================
// FAQ
// ====================================

faq:

  Array.isArray(
    json?.faq
  )

    ? json.faq

    : [],

// ====================================
// Breadcrumbs
// ====================================

breadcrumbs:

  Array.isArray(
    json?.breadcrumbs
  )

    ? json.breadcrumbs

    : [],

// ====================================
// Schemas
// ====================================

schemas:

  json?.schemas
  || {},

// ====================================
// UI
// ====================================

ui:

  json?.ui
  || {},

// ====================================
// Raw Backup
// ====================================

raw:
  json,


}
}
