// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/safeFetch.ts

/* =========================================
🔥 Logger
========================================= */

import {

  logRequest,

  logResponse,

  logError,

} from './apiLogger'

/* =========================================
🔥 Config
========================================= */

const DEFAULT_TIMEOUT =
  10000

/* =========================================
🔥 Safe Fetch
========================================= */

export async function
safeFetch<T = any>(

  endpoint: string,

  options?: RequestInit,

  timeout =
    DEFAULT_TIMEOUT
): Promise<T> {

  // ======================================
  // Abort Controller
  // ======================================

  const controller =
    new AbortController()

  const timer =
    setTimeout(() => {

      controller.abort()

    }, timeout)

  try {

    // ====================================
    // Request Log
    // ====================================

    logRequest(
      endpoint,
      options
    )

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
        }
      )

    // ====================================
    // Response Error
    // ====================================

    if (!response.ok) {

      const errorPayload = {

        status:
          response.status,

        statusText:
          response.statusText,

        endpoint,
      }

      logError(
        'API RESPONSE ERROR',
        errorPayload
      )

      throw new Error(
        `API Error: ${response.status}`
      )
    }

    // ====================================
    // JSON
    // ====================================

    const data =
      await response.json()

    // ====================================
    // Response Log
    // ====================================

    logResponse(
      endpoint,
      data
    )

    return data

  } catch (error) {

    // ====================================
    // Abort
    // ====================================

    if (
      error instanceof DOMException
      && error.name === 'AbortError'
    ) {

      logError(
        'API TIMEOUT',
        {
          endpoint,
          timeout,
        }
      )

      throw new Error(
        'API Timeout'
      )
    }

    // ====================================
    // Generic Error
    // ====================================

    logError(
      'SAFE FETCH ERROR',
      {
        endpoint,
        error,
      }
    )

    throw error

  } finally {

    clearTimeout(
      timer
    )
  }
}

