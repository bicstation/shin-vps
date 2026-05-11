// /app/concierge/lib/core/transport.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  TransportRequest,
} from '@/app/concierge/contracts/transport/TransportRequest'

import type {
  TransportResponse,
} from '@/app/concierge/contracts/transport/TransportResponse'

/* =========================================
🔥 HELPERS
========================================= */

import {
  safeString,
} from './helpers'

/* =========================================
🔥 API URL
========================================= */

const API_URL =

  process.env
    .NEXT_PUBLIC_API_URL
  || ''

/* =========================================
🔥 Build Headers
========================================= */

export function
buildHeaders(
  headers?: HeadersInit
): HeadersInit {

  return {

    'Content-Type':
      'application/json',

    ...(headers || {}),

  }
}

/* =========================================
🔥 Build URL
========================================= */

export function
buildURL(
  path?: string
): string {

  const safePath =

    safeString(path)

  if (
    !safePath
  ) {

    return API_URL
  }

  return `${API_URL}${safePath}`
}

/* =========================================
🔥 Transport GET
========================================= */

export async function
transportGet<T>({
  path,
  headers,
}: TransportRequest): Promise<
  TransportResponse<T>
> {

  try {

    const response =

      await fetch(

        buildURL(path),

        {
          method:
            'GET',

          headers:
            buildHeaders(
              headers
            ),

          cache:
            'no-store',
        }

      )

    if (
      !response.ok
    ) {

      throw new Error(
        `GET ${path} failed`
      )
    }

    const data =
      await response.json()

    return {

      success:
        true,

      data,

      error:
        null,

    }

  } catch (error: any) {

    console.error(
      '🔥 Transport GET Error'
    )

    console.error(error)

    return {

      success:
        false,

      data:
        null,

      error:
        error?.message
        || 'transport_get_error',

    }
  }
}

/* =========================================
🔥 Transport POST
========================================= */

export async function
transportPost<T>({
  path,
  body,
  headers,
}: TransportRequest): Promise<
  TransportResponse<T>
> {

  try {

    const response =

      await fetch(

        buildURL(path),

        {
          method:
            'POST',

          headers:
            buildHeaders(
              headers
            ),

          body:
            JSON.stringify(
              body || {}
            ),
        }

      )

    if (
      !response.ok
    ) {

      throw new Error(
        `POST ${path} failed`
      )
    }

    const data =
      await response.json()

    return {

      success:
        true,

      data,

      error:
        null,

    }

  } catch (error: any) {

    console.error(
      '🔥 Transport POST Error'
    )

    console.error(error)

    return {

      success:
        false,

      data:
        null,

      error:
        error?.message
        || 'transport_post_error',

    }
  }
}

/* =========================================
🔥 Transport DELETE
========================================= */

export async function
transportDelete<T>({
  path,
  headers,
}: TransportRequest): Promise<
  TransportResponse<T>
> {

  try {

    const response =

      await fetch(

        buildURL(path),

        {
          method:
            'DELETE',

          headers:
            buildHeaders(
              headers
            ),
        }

      )

    if (
      !response.ok
    ) {

      throw new Error(
        `DELETE ${path} failed`
      )
    }

    const data =
      await response.json()

    return {

      success:
        true,

      data,

      error:
        null,

    }

  } catch (error: any) {

    console.error(
      '🔥 Transport DELETE Error'
    )

    console.error(error)

    return {

      success:
        false,

      data:
        null,

      error:
        error?.message
        || 'transport_delete_error',

    }
  }
}

/* =========================================
🔥 Normalize Response
========================================= */

export function
normalizeTransportResponse<T>(
  response?:
    TransportResponse<T>
): TransportResponse<T> {

  return {

    success:
      response?.success
      || false,

    data:
      response?.data
      || null,

    error:
      response?.error
      || null,

  }
}
``