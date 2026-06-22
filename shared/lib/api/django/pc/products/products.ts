// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/products.ts
// ============================================================================

import {

  buildEndpoint,

} from '../utils/buildEndpoint'

import {

  safeFetch,

} from '../utils/safeFetch'

import type {

  ProductsRuntime,

} from './contracts'

import {

  normalizeProducts,

} from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const PRODUCTS_ENDPOINT =
  '/pc/products/'

/* ============================================================================
🔥 Fetch Products
============================================================================ */

export async function fetchProducts(

  params?: Record<
    string,
    string | number | boolean
  >

): Promise<ProductsRuntime> {

  const query =

    params

      ? `?${
          new URLSearchParams(
            Object.entries(
              params
            ).reduce(
              (
                acc,
                [key, value]
              ) => {

                acc[key] =
                  String(value)

                return acc

              },
              {} as Record<
                string,
                string
              >
            )
          )
        }`

      : ''

  const endpoint =

    buildEndpoint(
      `${PRODUCTS_ENDPOINT}${query}`
    )

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 FETCH PRODUCTS'
  )

  console.log({
    endpoint,
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  const payload =

    await safeFetch(
      endpoint
    )

  const products =

    normalizeProducts(
      payload
    )

  console.log(
    '🔥 PRODUCTS RUNTIME',
    {
      count:
        products.length,
    }
  )

  return {

    success:
      !!payload,

    products,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchProducts