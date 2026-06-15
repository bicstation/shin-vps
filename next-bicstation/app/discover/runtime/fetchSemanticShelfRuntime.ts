import {
  buildEndpoint,
} from '@/shared/lib/api/django/pc/utils/buildEndpoint'

import type {
  SemanticShelfRuntimeResponse,
} from './contracts'

export async function fetchSemanticShelfRuntime(

  attribute: string

): Promise<SemanticShelfRuntimeResponse> {

  try {

    const endpoint =

      buildEndpoint(
        `/pc/discover/${attribute}/`
      )

    console.log(
      '🔥 DISCOVER DETAIL FETCH',
      {
        attribute,
        endpoint,
      }
    )

    const response =

      await fetch(
        endpoint,
        {
          cache: 'no-store',
        }
      )

    if (!response.ok) {

      throw new Error(
        `Failed discovery detail: ${attribute}`
      )
    }

    const runtime =
      await response.json()
    
    console.log(
      '🔥 DISCOVER SAMPLE',
      runtime?.sample_products?.[0]
    )

    return {

      success:
        !!runtime?.found,

      shelf:
        runtime?.group_slug
        || attribute,

      count:
        runtime?.product_count
        || 0,

      products:

        Array.isArray(
          runtime?.sample_products
        )

          ? runtime.sample_products

          : [],

      next_shelves: [],

      raw:
        runtime,
    }

  } catch (error) {

    console.error(
      '🔥 Discovery Detail Error:',
      attribute,
      error
    )

    return {

      success: false,

      shelf: attribute,

      count: 0,

      products: [],

      next_shelves: [],
    }
  }
}

export default fetchSemanticShelfRuntime