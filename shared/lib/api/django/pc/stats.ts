
/* =========================================
🔥 Imports
========================================= */

import { cache } from 'react'

import {
  getApiBase,
} from '@/shared/lib/config/api'

/* =========================================
🔥 Types
========================================= */

import type {
  SemanticPayload,
} from '@/shared/types/semantic'

/* =========================================
🔥 Product
========================================= */

export type SemanticProduct =
  SemanticPayload & {

    id?: number

    unique_id?: string

    name?: string

    maker?: string

    price?: number

    image_url?: string

    url?: string

    summary?: any

    ai_content?: string

    score_cpu?: number
    score_gpu?: number
    score_cost?: number
    score_ai?: number
    score_portable?: number
  }

/* =========================================
🔥 Fetch Result
========================================= */

type FetchResult<T> = {

  ok: boolean

  data: T | null

  error?: unknown
}

/* =========================================
🔥 Config
========================================= */

const IS_DEV =
  process.env.NODE_ENV ===
  'development'

/* =========================================
🔥 Logger
========================================= */

function logInfo(
  label: string,
  payload?: unknown
) {

  if (!IS_DEV) {
    return
  }

  console.log(
    `[${label}]`,
    payload ?? ''
  )
}

function logError(
  label: string,
  payload?: unknown
) {

  console.error(
    `[${label}]`,
    payload ?? ''
  )
}

/* =========================================
🔥 Safe JSON
========================================= */

async function safeJson(
  res: Response,
  url?: string
) {

  try {

    const text =
      await res.text()

    if (!text) {
      return null
    }

    if (
      !text.trim()
        .startsWith('{')
      &&
      !text.trim()
        .startsWith('[')
    ) {

      logError(
        'INVALID_JSON_RESPONSE',
        {
          url,
          preview:
            text.slice(0, 120),
        }
      )

      return null
    }

    return JSON.parse(text)

  } catch (error) {

    logError(
      'JSON_PARSE_ERROR',
      {
        url,
        error,
      }
    )

    return null
  }
}

/* =========================================
🔥 Normalize Semantic Payload
========================================= */

function normalizeSemanticPayload(
  payload: any
): SemanticPayload {

  return {

    semantic_schema_version:
      payload
        ?.semantic_schema_version
      || 1,

    attributes:
      Array.isArray(
        payload?.attributes
      )
        ? payload.attributes
        : [],

    grouped_attributes:
      (
        payload?.grouped_attributes
        &&
        typeof payload.grouped_attributes
          === 'object'
      )
        ? payload.grouped_attributes
        : {},
  }
}

/* =========================================
🔥 Normalize Product
========================================= */

function normalizeProduct(
  product: any
): SemanticProduct {

  const semantic =
    normalizeSemanticPayload(
      product
    )

  return {

    ...product,

    ...semantic,

    unique_id:
      product?.unique_id || '',

    name:
      product?.name || '',

    maker:
      product?.maker || '',

    image_url:
      product?.image_url || '',

    url:
      product?.url || '',
  }
}

/* =========================================
🔥 Normalize Results
========================================= */

function normalizeResults<T>(
  data: any
): T[] {

  if (
    Array.isArray(data)
  ) {
    return data
  }

  if (
    Array.isArray(
      data?.results
    )
  ) {
    return data.results
  }

  return []
}

/* =========================================
🔥 Django Fetch
========================================= */

async function fetchFromDjango<T>(
  path: string,
  options?: {
    revalidate?: number
  }
): Promise<
  FetchResult<T>
> {

  try {

    const API_BASE =
      getApiBase()

    if (!API_BASE) {

      logError(
        'API_BASE_MISSING'
      )

      return {
        ok: false,
        data: null,
      }
    }

    const url =
      `${API_BASE}${path}`

    logInfo(
      'FETCH_START',
      { url }
    )

    const res =
      await fetch(url, {
        next: {
          revalidate:
            options?.revalidate
            || 60,
        },
      })

    if (!res.ok) {

      logError(
        'FETCH_FAILED',
        {
          url,
          status:
            res.status,
        }
      )

      return {
        ok: false,
        data: null,
      }
    }

    const data =
      await safeJson(
        res,
        url
      )

    if (!data) {

      return {
        ok: false,
        data: null,
      }
    }

    return {
      ok: true,
      data,
    }

  } catch (error) {

    logError(
      'FETCH_FATAL',
      error
    )

    return {
      ok: false,
      data: null,
      error,
    }
  }
}

/* =========================================
🔥 Ranking API
========================================= */

export const fetchPCProductRanking =
  cache(async function (
    slug: string = 'score'
  ): Promise<
    SemanticProduct[]
  > {

    const path =
      slug === 'score'
        ? '/general/pc-products/ranking/'
        : `/general/pc-products/ranking/${slug}/`

    const result =
      await fetchFromDjango<any>(
        path,
        {
          revalidate: 60,
        }
      )

    if (!result.ok) {
      return []
    }

    const normalized =
      normalizeResults<any>(
        result.data
      )

    return normalized.map(
      normalizeProduct
    )
  })

/* =========================================
🔥 Product Detail
========================================= */

export const fetchPCProductDetail =
  cache(async function (
    unique_id: string
  ): Promise<
    SemanticProduct | null
  > {

    if (!unique_id) {
      return null
    }

    const result =
      await fetchFromDjango<any>(
        `/general/pc-products/${unique_id}/`,
        {
          revalidate: 300,
        }
      )

    if (!result.ok) {
      return null
    }

    return normalizeProduct(
      result.data
    )
  })

/* =========================================
🔥 Related Products
========================================= */

export const fetchRelatedProducts =
  cache(async function (
    unique_id: string
  ): Promise<
    SemanticProduct[]
  > {

    if (!unique_id) {
      return []
    }

    const result =
      await fetchFromDjango<any>(
        `/general/pc-products/${unique_id}/related/`,
        {
          revalidate: 300,
        }
      )

    if (!result.ok) {
      return []
    }

    return normalizeResults<any>(
      result.data
    ).map(
      normalizeProduct
    )
  })

/* =========================================
🔥 Sidebar Stats
========================================= */

export const fetchSidebarStats =
  cache(async function () {

    const result =
      await fetchFromDjango<any>(
        '/general/pc-sidebar-stats/',
        {
          revalidate: 300,
        }
      )

    if (!result.ok) {

      return {
        gpu: [],
        makers: [],
      }
    }

    const data =
      result.data || {}

    return {

      gpu:
        Array.isArray(
          data?.gpu
        )
          ? data.gpu
          : [],

      makers:
        Array.isArray(
          data?.maker_counts
        )
          ? data.maker_counts
          : [],
    }
  })

/* =========================================
🔥 Semantic Finder
========================================= */

/**
 * TODO:
 * backend semantic finder contract
 * will migrate to GET query API
 */

export async function fetchFinderResult(
  body: Record<
    string,
    unknown
  >
) {

  try {

    const API_BASE =
      getApiBase()

    if (!API_BASE) {
      return []
    }

    const url =
      `${API_BASE}/general/finder/`

    const res =
      await fetch(url, {

        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify(body),

        cache: 'no-store',
      })

    if (!res.ok) {
      return []
    }

    const data =
      await safeJson(
        res,
        url
      )

    return normalizeResults(
      data
    )

  } catch (error) {

    logError(
      'FINDER_ERROR',
      error
    )

    return []
  }
}