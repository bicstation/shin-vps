/**
 * SHIN CORE LINX
 * Semantic Runtime Transport
 *
 * safeRuntimeFetch
 *
 * Responsibilities:
 * - runtime-safe fetch
 * - shallow payload validation
 * - semantic-safe transport
 * - traversal-safe payload delivery
 */

import type {
  RuntimeResponse,
} from '../contracts/runtime'

export async function safeRuntimeFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<RuntimeResponse<T>> {

  const transportStart =
    performance.now()

  console.log(
    '⏱️ RUNTIME TRANSPORT START',
    {
      url,
      method:
        options?.method || 'GET',
    }
  )

  try {

    /* ========================================================================
    🔥 HTTP Fetch
    ======================================================================== */

    const fetchStart =
      performance.now()

    const response = await fetch(url, {

      ...options,

      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },

      /**
       * IMPORTANT:
       * Runtime payloads should remain fresh.
       */
      cache: 'no-store',

    })

    const fetchElapsed =
      performance.now() - fetchStart

    console.log(
      '⏱️ RUNTIME FETCH RESPONSE',
      {
        url,
        status:
          response.status,
        ok:
          response.ok,
        elapsed:
          `${fetchElapsed.toFixed(2)}ms`,
      }
    )

    /* ========================================================================
    🔥 Runtime Transport Failure
    ======================================================================== */

    if (!response.ok) {

      console.error(
        '🔥 RUNTIME FETCH FAILED',
        {
          url,
          status:
            response.status,
          elapsed:
            `${fetchElapsed.toFixed(2)}ms`,
        }
      )

      return {
        success: false,
        data: null,
        error:
          `Runtime fetch failed: ${response.status}`,
        status:
          response.status,
      }
    }

    /* ========================================================================
    🔥 JSON Parse
    ======================================================================== */

    const jsonStart =
      performance.now()

    const json =
      await response.json()

    const jsonElapsed =
      performance.now() - jsonStart

    console.log(
      '⏱️ RUNTIME JSON PARSE COMPLETE',
      {
        url,
        elapsed:
          `${jsonElapsed.toFixed(2)}ms`,
      }
    )

    /* ========================================================================
    🔥 Payload Validation
    ======================================================================== */

    /**
     * IMPORTANT:
     *
     * Transport layer intentionally avoids:
     * - semantic inference
     * - workflow transformation
     * - traversal modification
     * - edge mutation
     *
     * Backend remains semantic authority.
     */

    if (json == null) {

      const totalElapsed =
        performance.now() - transportStart

      console.warn(
        '⚠️ RUNTIME PAYLOAD NULL',
        {
          url,
          elapsed:
            `${totalElapsed.toFixed(2)}ms`,
        }
      )

      return {
        success: false,
        data: null,
        error:
          'Runtime payload is null',
        status:
          response.status,
      }
    }

    /* ========================================================================
    🔥 Transport Complete
    ======================================================================== */

    const totalElapsed =
      performance.now() - transportStart

    console.log(
      '⏱️ RUNTIME TRANSPORT COMPLETE',
      {
        url,
        status:
          response.status,
        fetch:
          `${fetchElapsed.toFixed(2)}ms`,
        json:
          `${jsonElapsed.toFixed(2)}ms`,
        total:
          `${totalElapsed.toFixed(2)}ms`,
      }
    )

    /* ========================================================================
    🔥 Success
    ======================================================================== */

    return {
      success: true,
      data:
        json as T,
      status:
        response.status,
    }

  } catch (error) {

    const totalElapsed =
      performance.now() - transportStart

    console.error(
      '🔥 RUNTIME TRANSPORT ERROR',
      {
        url,
        elapsed:
          `${totalElapsed.toFixed(2)}ms`,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown semantic runtime transport error',
      }
    )

    return {
      success: false,
      data: null,

      error:
        error instanceof Error
          ? error.message
          : 'Unknown semantic runtime transport error',
    }
  }
}