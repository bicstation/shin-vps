// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/utils/safeFetch.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.

/* =========================================
🔥 Safe Fetch
========================================= */

export async function
safeFetch<T = any>(

  endpoint: string,

  options?: RequestInit

): Promise<T | null> {

  try {

    // ====================================
    // Fetch
    // ====================================

    const response =

      await fetch(
        endpoint,
        {
          ...options,

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
    // Response Error
    // ====================================

    if (!response.ok) {

      console.error(

        '🔥 API RESPONSE ERROR',

        {
          status:
            response.status,

          endpoint,
        }
      )

      return null
    }

    // ====================================
    // JSON
    // ====================================

    const data =
      await response.json()

    // ====================================
    // Success
    // ====================================

    return data

  } catch (error) {

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