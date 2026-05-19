// /shared/lib/api/django/pc/ranking/fetchRankingProducts.ts

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
🔥 Fetch Ranking Products
========================================= */

export async function
fetchRankingProducts(

type = 'score'

) {

// ======================================
// Endpoint
// ======================================

const endpoint =


buildEndpoint(

  `/general/pc-products/ranking/${type}/`

)


// ======================================
// Fetch
// ======================================

const json =


await safeFetch(
  endpoint
)


// ======================================
// Runtime Debug
// ======================================

console.log(
'🔥 FETCH RANKING PRODUCTS URL',
endpoint
)

console.log(
'🔥 FETCH RANKING PRODUCTS RAW',
json
)

// ======================================
// Empty Guard
// ======================================

if (!json) {


return {

  success: false,

  ranking: {

    results: [],
  },

  raw: null,
}


}

// ======================================
// Minimal Semantic Normalize
// ======================================

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
// Raw Backup
// ====================================

raw:
  json,


}
}
