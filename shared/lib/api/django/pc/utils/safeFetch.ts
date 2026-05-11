// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/safeFetch.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Types
========================================= */

type SafeFetchOptions =

  RequestInit & {

    timeout?: number
  }

/* =========================================
🔥 Safe Fetch
========================================= */

export async function
safeFetch<T = any>(

  endpoint: string,

  options?: SafeFetchOptions

): Promise<T | null> {

  // ======================================
  // Timeout
  // ======================================

  const timeout =

    typeof options?.timeout
      === 'number'

      ? options.timeout

      : 15000

  // ======================================
  // Abort Controller
  // ======================================

  const controller =

    new AbortController()

  // ======================================
  // Timeout Timer
  // ======================================

  const timeoutId =

    setTimeout(
      () => {

        controller.abort()

      },
      timeout
    )

  try {

    // ====================================
    // Fetch
    // ====================================

    const response =

      await fetch(
        endpoint,
        {
          ...options,

          signal:
            controller.signal,

          headers: {

            'Content-Type':
              'application/json',

            ...(options?.headers || {}),
          },

          cache:
            'no-store',
        }
      )

    // ====================================
    // Clear Timeout
    // ====================================

    clearTimeout(
      timeoutId
    )

    // ====================================
    // Response Error
    // ====================================

    if (!response.ok) {

      console.error(

        '🔥 API RESPONSE ERROR',

        {
          endpoint,

          status:
            response.status,

          statusText:
            response.statusText,
        }
      )

      return null
    }

    // ====================================
    // JSON Parse
    // ====================================

    let data: T

    try {

      data =
        await response.json()

    } catch (jsonError) {

      console.error(

        '🔥 JSON PARSE ERROR',

        {
          endpoint,
          jsonError,
        }
      )

      return null
    }

    // ====================================
    // Success
    // ====================================

    return data

  } catch (error: any) {

    // ====================================
    // Clear Timeout
    // ====================================

    clearTimeout(
      timeoutId
    )

    // ====================================
    // Abort Error
    // ====================================

    if (
      error?.name ===
      'AbortError'
    ) {

      console.error(

        '🔥 FETCH TIMEOUT',

        {
          endpoint,
          timeout,
        }
      )

      return null
    }

    // ====================================
    // Network Error
    // ====================================

    console.error(

      '🔥 SAFE FETCH ERROR',

      {
        endpoint,
        error,
      }
    )

    return null
  }
}