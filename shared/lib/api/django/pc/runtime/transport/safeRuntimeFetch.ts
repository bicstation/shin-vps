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
  try {
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

    /**
     * Runtime transport failure
     */
    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: `Runtime fetch failed: ${response.status}`,
        status: response.status,
      }
    }

    const json = await response.json()

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
      return {
        success: false,
        data: null,
        error: 'Runtime payload is null',
        status: response.status,
      }
    }

    return {
      success: true,
      data: json as T,
      status: response.status,
    }
  } catch (error) {
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