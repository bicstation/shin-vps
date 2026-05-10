// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/products/products.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

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
🔥 Normalize
========================================= */

import {

  normalizeProducts,

} from './normalize'

/* =========================================
🔥 Endpoint
========================================= */

const PRODUCTS_ENDPOINT =
  '/general/pc-products/'

/* =========================================
🔥 Fetch Products
========================================= */

export async function
fetchProducts(

  page: number = 1,

  limit: number = 20
) {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(

      `${PRODUCTS_ENDPOINT}?page=${page}&limit=${limit}`
    )

  // ======================================
  // Fetch
  // ======================================

  const response =

    await safeFetch(
      endpoint
    )

  // ======================================
  // Normalize
  // ======================================

  return normalizeProducts(
    response
  )
}

/* =========================================
🔥 Preset Collections
========================================= */

export async function
fetchLatestProducts() {

  return fetchProducts(
    1,
    20
  )
}

export async function
fetchPopularProducts() {

  return fetchProducts(
    1,
    50
  )
}