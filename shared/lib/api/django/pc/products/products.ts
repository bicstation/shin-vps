// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/products/products.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Contracts
========================================= */

import type {

  PCProductsResponse,

  PCProductItem,

} from './contracts'

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
  '/pc/products/'

/* =========================================
🔥 Fetch Products
========================================= */

export async function
fetchProducts(

  page: number = 1,

  limit: number = 20

): Promise<PCProductItem[]> {

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

    await safeFetch<PCProductsResponse>(
      endpoint
    )

  // ======================================
  // Invalid Response
  // ======================================

  if (
    !response
    ||
    !response.success
  ) {

    return []
  }

  // ======================================
  // Normalize
  // ======================================

  return normalizeProducts(
    response
  )
}

/* =========================================
🔥 Latest Products
========================================= */

export async function
fetchLatestProducts()

: Promise<PCProductItem[]> {

  return fetchProducts(
    1,
    20
  )
}

/* =========================================
🔥 Popular Products
========================================= */

export async function
fetchPopularProducts()

: Promise<PCProductItem[]> {

  return fetchProducts(
    1,
    50
  )
}