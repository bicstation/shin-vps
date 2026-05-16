// /shared/lib/api/django/pc/semantic/fetchSemanticGroupedAttributes.ts

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

export type SemanticGroupedAttribute = {

  slug?: string

  name?: string

  icon?: string

  color?: string

  count?: number

  semantic_role?: string

  semantic_weight?: number
}

export type SemanticGroupedAttributesRuntime =

  Record<
    string,
    SemanticGroupedAttribute[]
  >

/* =========================================
🔥 Fetch Semantic Grouped Attributes
========================================= */

export async function
fetchSemanticGroupedAttributes()

: Promise<
    SemanticGroupedAttributesRuntime
  > {

  /* ======================================
  🔥 Endpoint
  ====================================== */

  const endpoint =

    buildEndpoint(

      '/general/semantic/grouped-attributes/'

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

  return json || {}
}